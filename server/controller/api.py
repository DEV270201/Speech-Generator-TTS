import db_models as db_models
from fastapi import HTTPException
from utils import model_helper
import numpy as np
import librosa
from transformers import AutoTokenizer
from tqdm import tqdm
import uuid
import soundfile as sf
import asyncio
import datetime
import aiofiles.os
from pathlib import Path
from utils import error

MAX_CACHE_SIZE = 5  # Maximum number of files to keep in cache (local cache)
file_cache = {}

class RepetitionPenaltyLogitsProcessor:
    def __init__(self, penalty: float):
        if not isinstance(penalty, float) or not (penalty > 0):
            raise ValueError(f"`penalty` must be a strictly positive float, but is {penalty}")
        self.penalty = penalty

    def __call__(self, input_ids: np.ndarray, scores: np.ndarray) -> np.ndarray:
        score = np.take_along_axis(scores, input_ids, axis=1)
        score = np.where(score < 0, score * self.penalty, score / self.penalty)
        scores_processed = scores.copy()
        np.put_along_axis(scores_processed, input_ids, score, axis=1)
        return scores_processed

# function for fetching audio history 
async def fetch_history_controller(db):
    try:
        audio_history = db.query(db_models.Audio).all()
        print("History: ", audio_history)
        return audio_history
    except Exception as e:
        print(f"Error in /audio-history endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during fetching audio history")

#GENERATING AUDIO
# function for running the text to speech inference 
def text_to_speech_inference(text, exaggeration=0.5, max_new_tokens=256):
        print(f"Received text for synthesis: {text}")
        default_voice_path = model_helper.model_path / "default_voice.wav"

        #loading the default voice and preprocessing it
        audio_values, _ = librosa.load(default_voice_path, sr=model_helper.S3GEN_SR)
        audio_values = audio_values[np.newaxis, :].astype(np.float32)

        ## tokeinizing input for feeeding it to the embedding model
        tokenizer = AutoTokenizer.from_pretrained(model_helper.model_id)
        input_ids = tokenizer(text, return_tensors="np", truncation=False)["input_ids"].astype(np.int64)

        position_ids = np.where(
            input_ids >= model_helper.START_SPEECH_TOKEN,
            0,
            np.arange(input_ids.shape[1])[np.newaxis, :] - 1
        )

        ort_embed_tokens_inputs = {
            "input_ids": input_ids,
            "position_ids": position_ids,
            "exaggeration": np.array([exaggeration], dtype=np.float32)
        }

        ## Instantiate the logits processors.
        repetition_penalty = 1.2
        repetition_penalty_processor = RepetitionPenaltyLogitsProcessor(penalty=repetition_penalty)

        num_hidden_layers = 30
        num_key_value_heads = 16
        head_dim = 64

        generate_tokens = np.array([[model_helper.START_SPEECH_TOKEN]], dtype=np.long)
        print("generate tokens: ", generate_tokens.shape)



        #generation loop for generating speech tokens
        for i in tqdm(range(max_new_tokens), desc="Sampling", dynamic_ncols=True):

            inputs_embeds = model_helper.embed_tokens.run(None, ort_embed_tokens_inputs)[0]
            if i == 0:
                ort_speech_encoder_input = {
                    "audio_values": audio_values,
                }
                cond_emb, prompt_token, ref_x_vector, prompt_feat = model_helper.speech_encoder.run(None, ort_speech_encoder_input)
                inputs_embeds = np.concatenate((cond_emb, inputs_embeds), axis=1)

                ## Prepare llm inputs
                batch_size, seq_len, _ = inputs_embeds.shape
                past_key_values = {
                    f"past_key_values.{layer}.{kv}": np.zeros([batch_size, num_key_value_heads, 0, head_dim], dtype=np.float32)
                    for layer in range(num_hidden_layers)
                    for kv in ("key", "value")
                }
                attention_mask = np.ones((batch_size, seq_len), dtype=np.int64)

            logits, *present_key_values = model_helper.language_model.run(None, dict(
                inputs_embeds=inputs_embeds,
                attention_mask=attention_mask,
                **past_key_values,
            ))

            logits = logits[:, -1, :]
            next_token_logits = repetition_penalty_processor(generate_tokens, logits)

            next_token = np.argmax(next_token_logits, axis=-1, keepdims=True).astype(np.int64)
            generate_tokens = np.concatenate((generate_tokens, next_token), axis=-1)
            if (next_token.flatten() == model_helper.STOP_SPEECH_TOKEN).all():
                break

            #getting the embeddings for the new token.
            position_ids = np.full(
                (input_ids.shape[0], 1),
                i + 1,
                dtype=np.int64,
            )
            ort_embed_tokens_inputs["input_ids"] = next_token
            ort_embed_tokens_inputs["position_ids"] = position_ids

            #updating values for next generation loop
            attention_mask = np.concatenate([attention_mask, np.ones((batch_size, 1), dtype=np.int64)], axis=1)
            for j, key in enumerate(past_key_values):
                past_key_values[key] = present_key_values[j]

        speech_tokens = generate_tokens[:, 1:-1]
        speech_tokens = np.concatenate([prompt_token, speech_tokens], axis=1)
        return speech_tokens, ref_x_vector, prompt_feat


# supporting function for generating audio
def generate_audio(text,exaggeration=0.5, max_new_tokens=1000):
    try:
        speech_tokens, speaker_embeddings, speaker_features = text_to_speech_inference(text, exaggeration, max_new_tokens)
        print("Speech tokens: ", speech_tokens.shape)
        condtional_encoder_input = {
            "speech_tokens": speech_tokens,
            "speaker_embeddings": speaker_embeddings,
            "speaker_features": speaker_features
        }
        speech_wav = model_helper.conditional_decoder.run(None, condtional_encoder_input)[0]
        speech_wav = np.squeeze(speech_wav,axis=0)
        filename = f"audio_{uuid.uuid4().hex}.wav"
        audio_destination = model_helper.audio_path / filename
        sf.write(audio_destination, speech_wav, model_helper.S3GEN_SR)
        print("Speech was successfully saved @", filename)
        duration = librosa.get_duration(y=speech_wav, sr=model_helper.S3GEN_SR)
        print(f"Duration of the generated audio: {duration} seconds")
        return filename, duration
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during inference: {e}")

# function for generating audio
async def generate_audio_controller(tts, db):
    try:
        text = tts.text
        exaggeration = tts.exaggeration
        temperature = tts.temperature
        cfg = tts.cfg
        print(f"text: {text}, exaggeration: {exaggeration}, temperature: {temperature}, cfg: {cfg}")
        # text to speech conversion and saving the audio file
        curr_path, duration = await asyncio.to_thread(generate_audio, text, exaggeration)
        # save the metadata to the database
        db_audio = db_models.Audio(
            filename=curr_path,
            exaggeration_factor=exaggeration,
            temperature=temperature,
            cfg_factor=cfg,
            format="wav",
            text=text,
            duration=duration,
            creation_date=datetime.datetime.now().date()
        )
        try:
            db.add(db_audio)
            db.commit()
            db.refresh(db_audio)
        except Exception as e:
            #can input retry mechanism to handle temporary DB issues 
            print(f"Database error: {e}")
            raise HTTPException(status_code=500, detail="Database error while saving audio metadata.")
        return curr_path, db_audio.id, duration
    except Exception as e:
        print(f"Error in /generate endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during speech generation.")

#STREAMING AUDIO
#function for joining the chunks asynchronously
async def join_chunks_async(chunks: list):
    if not chunks:
        return b""
    
    # For small files, join directly
    total_size = sum(len(chunk) for chunk in chunks)
    if total_size < 50 * 1024 * 1024:  # Less than 50MB
        return b"".join(chunks)
    
    # For large files, join in batches and yield control
    result = b""
    batch_size = 10  # Process 10 chunks at a time
    
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        result += b"".join(batch)
        await asyncio.sleep(0)
    
    return result

# function for streaming audio chunk by chunk 
async def generate_audio_chunks(file_path: Path, chunk_size: int = 8192):
    try:
        if file_path in file_cache:
            print(f"Using cached audio file: {file_path.name}")
            audio_data = file_cache[file_path]
            for i in range(0, len(audio_data), chunk_size):
                yield audio_data[i:i + chunk_size]
            return
        # using asynchronous operations to load the chunks 
        chunks = []
        async with aiofiles.open(file_path, "rb") as audio_file:
            while True:
                chunk = await audio_file.read(chunk_size)
                if not chunk:
                    break
                chunks.append(chunk)
                yield chunk
        audio_data = b"".join(chunks)
        if len(file_cache) >= MAX_CACHE_SIZE:
            evicted_file = next(iter(file_cache))
            print(f"Evicting cached file: {evicted_file.name}")
            del file_cache[evicted_file]
        file_cache[file_path] = audio_data
    except Exception as e:
        print(f"Error reading audio file {file_path}: {e}")
        raise error.AudioStreamError(message="Error reading audio file.", status_code=500)


# controller function for streaming audio 
async def stream_audio_controller(audio_to_play_id, db):
    try:
        #get the filename from the database using the audio_to_play_id
        audio_record = db.query(db_models.Audio).filter(db_models.Audio.id == audio_to_play_id).first()
        if not audio_record:
            print(f"Audio record with ID {audio_to_play_id} not found.")
            raise error.AudioStreamError(message=f"Audio file not found.", status_code=404)
        filename = audio_record.filename
        file_path = model_helper.audio_path / filename
        #checks if the files exists or not asynchronously
        if not await aiofiles.os.path.exists(model_helper.audio_path):
            print(f"Audio file {filename} not found.")
            raise error.AudioStreamError(message=f"Audio file not found.", status_code=404)
        content_type = "audio/wav"
        headers = {
            'Content-Type': content_type,
        }
        print(f"Streaming audio file: {filename}")
        return file_path, content_type, headers
    #exception handling
    except error.AudioStreamError as ase:
        print(f"Error streaming audio file: {ase}")
        raise HTTPException(status_code=ase.status_code, detail=ase.message)
    except Exception as e:
        print(f"Error streaming audio file: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while streaming audio.")
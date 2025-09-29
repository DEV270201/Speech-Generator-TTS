from pathlib import Path
import onnxruntime as ort
import os
#configurations

MODEL_DIR = "./models/chatterbox/"
FILES = [
    "onnx/speech_encoder.onnx",
    "onnx/speech_encoder.onnx_data",
    "onnx/embed_tokens.onnx",
    "onnx/embed_tokens.onnx_data",
    "onnx/conditional_decoder.onnx",
    "onnx/conditional_decoder.onnx_data",
    "onnx/language_model.onnx",
    "onnx/language_model.onnx_data",
    "default_voice.wav", 
    ]
START_SPEECH_TOKEN = 6561
STOP_SPEECH_TOKEN = 6562
S3GEN_SR = 24000
model_id = "onnx-community/chatterbox-onnx"
#Global variables for model configurations
speech_encoder = None #processes audio input
embed_tokens = None #converts text to tokens
conditional_decoder = None #generates speech features
language_model = None #understands text meaning
model_path = Path(MODEL_DIR)
audio_path = Path("./audio/")

#this is the function for cecking if the machine has the model files or not
def checkModelFiles():
    if not model_path.exists() or not model_path.is_dir():
        print("Model directory does not exist.")
        return False
    missing_files = []
    for filename in FILES:
        if not Path(f"{MODEL_DIR}/{filename}").exists():
            missing_files.append(filename)
    if missing_files:
        print("Missing model files:", missing_files)
        return False
    return True

#this function will load the model present in the disk to the ram for fast processing
def loadModelAndConfigs():
     global speech_encoder, embed_tokens, conditional_decoder, language_model

     print("Loading models and configurations into the memory....")
     model_path = Path(MODEL_DIR)

     try:
         print('Loading speech encoder model...')
         speech_encode_path = model_path / "onnx/speech_encoder.onnx"
         speech_encoder = ort.InferenceSession(str(speech_encode_path))
         print('Speech encoder model loaded.')

         print('Loading embed tokens model...')
         embed_tokens_path = model_path / "onnx/embed_tokens.onnx"   
         embed_tokens = ort.InferenceSession(str(embed_tokens_path))
         print('Embed tokens model loaded.')

         print('Loading conditional decoder model...')
         conditional_decoder_path = model_path / "onnx/conditional_decoder.onnx"
         conditional_decoder = ort.InferenceSession(str(conditional_decoder_path))
         print('Conditional decoder model loaded.')

         print('Loading language model...')
         language_model_path = model_path / "onnx/language_model.onnx"
         language_model = ort.InferenceSession(str(language_model_path))
         print('Language model loaded.') 

         print("All models and configurations loaded successfully.") 

         return {
            "speech_encoder": speech_encoder,
            "embed_tokens": embed_tokens,
            "conditional_decoder": conditional_decoder,
            "language_model": language_model,
        }

     except Exception as e:
            print("Error loading models or configurations:", e)
            return False

#this function will print all the model related information
# def printModelsInfo():
#     print("Models Information: ")

#     models = [
#         ("Speech Encoder", speech_encoder),
#         ("Token Embeddings", embed_tokens), 
#         ("Conditional Decoder", conditional_decoder),
#         ("Language Model", language_model)
#     ]

#     for name, model in models:
#         if model:
#             print(f"{name}:")
#             print("  Inputs:")
#             for inp in model.get_inputs():
#                 print(f"    {inp.name}: {inp.shape} ({inp.type})")
#             print("  Outputs:")
#             for out in model.get_outputs():
#                 print(f"    {out.name}: {out.shape} ({out.type})")
#         else:
#             print(f"{name} model is not loaded.")

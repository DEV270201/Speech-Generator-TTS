from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import uvicorn
from contextlib import asynccontextmanager
import asyncio
from database import db_dependency
from schema import TTS
from fastapi.middleware.cors import CORSMiddleware
from utils import model_helper
from controller import api

#this function will be executed once when the application server starts for checking the model files and loading the same into the memory
def startupCheck():
    print("Checking model files...")
    if not model_helper.checkModelFiles():
        raise SystemError("Model files missing. Please run model_download.py first.")
    print("All model files are present.")
    models = model_helper.loadModelAndConfigs()
    if not models:
        raise SystemError("Failed to load models and configurations. Exiting.")
    return models

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        print("Starting up server and loading models...")
        # running on a different thread to prevent event loop from getting blocked
        models = await asyncio.to_thread(startupCheck)
        app.state.models = models
        yield
        print("Shutting down server...")
    except Exception as e:
        print("Startup failed:", e)
        raise SystemExit(1)
    
app = FastAPI(title="SpeechGenerator API", version="1.0", lifespan=lifespan)
#cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)   

#API endpoints
@app.get("/api/stream-audio/{audio_to_play_id}")
async def stream_audio(audio_to_play_id:int, db: db_dependency):
    try:
        file_path, content_type, headers = await api.stream_audio_controller(audio_to_play_id, db)
        return StreamingResponse(
            api.generate_audio_chunks(file_path),
            media_type=content_type,
            headers=headers
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e.detail))

@app.post("/api/generate-audio")
async def generate_audio(tts:TTS, db: db_dependency):
    try:
        curr_path, id, duration = await api.generate_audio_controller(tts,db)
        return {"message": "Speech generated successfully.", "filename": curr_path, "id": id, "duration": duration}
    except Exception as e:
        print(f"Error in /generate endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during speech generation.")

@app.get("/api/audio-history")
async def fetch_history(db: db_dependency):
    try:
        print(f"Getting audio history....")
        audio_history = await api.fetch_history_controller(db)
        return {"message": "Audio History fetched successfully.", "data": audio_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during fetching audio history")

def main():
    print("Starting SpeechGenerator Server...")
    uvicorn.run("main:app",host="127.0.0.1", port=8000, reload=True, log_level="info")

if __name__ == "__main__":
    main()

# this script will help in downloading the model from hugging face 
import os
from pathlib import Path
from huggingface_hub import hf_hub_download

class ChatterBoxDownload:   
    def __init__(self):
        self.repo_id = "onnx-community/chatterbox-onnx"
        self.model_dir = Path("./models/chatterbox/")

    def createModelDirectory(self):
        self.model_dir.mkdir(parents=True, exist_ok=True)
        print("Model directory created at:", self.model_dir)

    def downloadFiles(self, files):
        print("Starting download of model files...")
        for filename in files:
            try:
                dest_path = f"{self.model_dir}/{filename}"
                if(os.path.exists(dest_path)):
                    print(f"File already exists, skipping download: {dest_path}")
                    continue
                print(f"Downloading {filename}...")
                hf_hub_download(repo_id=self.repo_id, filename=filename, local_dir=self.model_dir)
                print(f"Downloaded and saved: {dest_path}")
            except Exception as e:
                print(f"Failed to download {filename}: {e}")
        print("Download completed!")

def main():
    # set of files needed for the chatterbox model 
    files = [
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

    downloader = ChatterBoxDownload()

    # create the model directory 
    downloader.createModelDirectory()

    # download the files from the Hugging Face Hub
    downloader.downloadFiles(files)

if __name__ == "__main__":
    main()
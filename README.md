# 🎙️ Speech Generator 

A powerful text-to-speech application that converts text into natural-sounding speech using the Chatterbox TTS model with local ONNX Runtime inference.

## 📌 About  
**Speech Generator** is a project that helps in generating speech from text using the **Chatterbox TTS model**. It runs locally with **ONNX Runtime** and provides natural-sounding speech output. The project features a **React.js Framework** and a **FastAPI backend** with **PostgreSQL** for data persistence.  

## Features

✨ **Current Features**
- Convert text into natural-sounding speech with ease
- Local inference using ONNX Runtime for faster processing
- Clean and intuitive user interface
- Persistent storage of generated speech history

🚀 **Upcoming Features**
- Configurable tone and exaggeration settings
- Support for different voices and datasets
- AWS integration for cloud-based processing
- Batch processing capabilities

## Tech Stack

### Frontend
- **Next.js** - React framework for the web application
- **Tailwind CSS** - Utility-first CSS framework for styling

### Backend
- **FastAPI** - Modern Python framework for building scalable RESTful APIs
- **PostgreSQL** - Relational database for application data storage
- **SQLAlchemy ORM** - SQL toolkit and Object-Relational Mapping
- **Alembic** - Database migration tool

### Machine Learning
- **Chatterbox TTS Model** - High-quality text-to-speech model
- **ONNX Runtime** - Cross-platform inference engine
- **Hugging Face** - Model hosting and management

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.11 or higher
- Node.js 18.x or higher
- pip (Python package manager)
- npm or yarn (Node package manager)

## Installation & Setup

### Server Setup

1. **Navigate to the server directory**
```bash
   cd server
```
2. **Install Python dependencies**
```bash
   pip install -r requirements.txt
```
3. **Download the TTS model**
```bash
   python model_download.py
```
This will download the Chatterbox TTS model from Hugging Face.

4. **Configure a PostgreSQL database for the project, then update the database connection string in `alembic.ini`**
```bash
   sqlalchemy.url = postgresql://username:password@localhost:5432/your_database_name
```
5. **Run database migrations to initialize the database schema**
```bash
   alembic upgrade head
```
6. **Start the FastAPI server**
```bash
   python main.py
```
The API will be available at `http://localhost:8000`

### Client Setup

1. **Navigate to the client directory**
```bash
   cd client
   cd speech-generator
```
2. **Install dependencies**
```bash
   npm install
   # or
   yarn install
```
3. **Start the development server**
```bash
  npm run dev
   # or
   yarn dev
```
The application will be available at `http://localhost:3000`

### Database Migrations
When making changes to your database models:

1. **Generate a new migration**
```bash
   alembic revision --autogenerate -m "description of your changes"
```
2. **Apply the migration**
```bash
  alembic upgrade head
```
3. **Rollback a migration (if needed)**
```
alembic downgrade -1
```

### Usage

1. Open the application in your browser at http://localhost:3000
2. Enter the text you want to convert to speech in the input field
3. Click the "Generate Audio" button
4. Listen to the generated audio or download it for later use
5. View your speech generation history in the dashboard

### HuggingFace Model Link (Chatterbox TTS - ONNX Runtime)
`https://huggingface.co/onnx-community/chatterbox-ONNX`
<h3 align="center">Developed with ❤️ by Devansh Shah</h3>


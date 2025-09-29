#this file contains the database setup for the application

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends
from typing import Annotated
import os
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

#gets the database session for interaction
def get_db():
    print("Getting DB session")
    db = SessionLocal()
    try:
        yield db    
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
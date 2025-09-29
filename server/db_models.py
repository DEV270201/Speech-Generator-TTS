#this file contains all the database tables

from sqlalchemy import Column, Integer, String, Float, Date, Text
from database import Base

class Audio(Base):
    __tablename__ = "audio"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True, nullable=False)
    creation_date = Column(Date, nullable=False)
    duration = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    format = Column(String, nullable=False)
    exaggeration_factor = Column(Float, nullable=False, default=0.5)
    temperature = Column(Float, nullable=False, default=0.8)
    cfg_factor = Column(Float, nullable=False, default=1.0)
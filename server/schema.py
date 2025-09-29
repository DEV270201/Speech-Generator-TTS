#this file contains all the schema for input validation from the user

from typing import Optional
from pydantic import BaseModel

class TTS(BaseModel):
    text: str
    exaggeration: Optional[float] = 0.5
    temperature: Optional[float] = 0.8
    cfg: Optional[float] = 1.0

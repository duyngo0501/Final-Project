from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from typing import Optional

db = SQLAlchemy()

class Game(db.Model):
    __tablename__ = 'games'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(512), nullable=True)
    stock = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'image_url': self.image_url,
            'stock': self.stock,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Pydantic Models
class GameCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    image_url: Optional[str] = None
    stock: int = Field(..., ge=0)

class GameResponse(BaseModel):
    message: str
    game_id: int

class GameDetail(BaseModel):
    id: int
    title: str
    description: Optional[str]
    price: float
    image_url: Optional[str]
    stock: int
    created_at: datetime
    updated_at: datetime 
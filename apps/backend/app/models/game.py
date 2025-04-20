from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base
# from .user import User # Import User only if needed for relationships defined here

class Game(Base):
    """
    SQLAlchemy model for games.
    """
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    stock = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True) # Match Flask app

    # Relationships
    # Relationship to the User who created the game
    creator = relationship("User", back_populates="created_games")
    # Relationship to cart items referencing this game
    cart_items = relationship("CartItem", back_populates="game")

    # Method to convert model to dictionary (similar to Flask version)
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "image_url": self.image_url,
            "stock": self.stock,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "created_by": self.created_by
            # Optionally include creator info if needed:
            # "creator": self.creator.to_dict() if self.creator else None
        } 
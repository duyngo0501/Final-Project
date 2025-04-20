from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from typing import List # Import List for type hint

from ..database import Base
from .game import Game # Import Game for relationship reference

class Cart(Base):
    """
    SQLAlchemy model for shopping carts.
    """
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

    # Method to convert model to dictionary (similar to Flask version)
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "items": [item.to_dict() for item in self.items] # Include items
        }

class CartItem(Base):
    """
    SQLAlchemy model for items within a shopping cart.
    """
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    cart = relationship("Cart", back_populates="items")
    game = relationship("Game", back_populates="cart_items")

    # Method to convert model to dictionary (similar to Flask version)
    def to_dict(self) -> dict:
        # Fetch related game details if needed
        game_data = self.game.to_dict() if self.game else None
        return {
            "id": self.id,
            "cart_id": self.cart_id,
            "game_id": self.game_id,
            "quantity": self.quantity,
            "added_at": self.added_at.isoformat() if self.added_at else None,
            "game": game_data # Include game details 
        } 
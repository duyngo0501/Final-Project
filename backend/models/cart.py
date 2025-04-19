from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import BaseModel

class Cart(BaseModel):
    __tablename__ = 'carts'

    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), unique=True, nullable=False)

    # Relationships
    user = relationship('User', back_populates='cart')
    items = relationship('CartItem', back_populates='cart', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Cart {self.id}>'

class CartItem(BaseModel):
    __tablename__ = 'cart_items'

    cart_id = Column(UUID(as_uuid=True), ForeignKey('carts.id'), nullable=False)
    game_id = Column(UUID(as_uuid=True), ForeignKey('games.id'), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    # Relationships
    cart = relationship('Cart', back_populates='items')
    game = relationship('Game', back_populates='cart_items')

    def __repr__(self):
        return f'<CartItem {self.id}>' 
from sqlalchemy import Column, String, Numeric, Text, Integer
from sqlalchemy.orm import relationship
from .base import BaseModel

class Game(BaseModel):
    __tablename__ = 'games'

    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    publisher = Column(String(255), nullable=False)
    genre = Column(String(100), nullable=False)
    image_url = Column(String(500))
    
    # Relationships
    order_items = relationship('OrderItem', back_populates='game')
    cart_items = relationship('CartItem', back_populates='game')

    def __repr__(self):
        return f'<Game {self.title}>' 
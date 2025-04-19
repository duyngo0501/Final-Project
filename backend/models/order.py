from sqlalchemy import Column, ForeignKey, Numeric, Integer, String, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel

class OrderStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Order(BaseModel):
    __tablename__ = 'orders'

    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    shipping_address = Column(String(500), nullable=False)

    # Relationships
    user = relationship('User', back_populates='orders')
    items = relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Order {self.id}>'

class OrderItem(BaseModel):
    __tablename__ = 'order_items'

    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'), nullable=False)
    game_id = Column(UUID(as_uuid=True), ForeignKey('games.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_time = Column(Numeric(10, 2), nullable=False)

    # Relationships
    order = relationship('Order', back_populates='items')
    game = relationship('Game', back_populates='order_items')

    def __repr__(self):
        return f'<OrderItem {self.id}>' 
import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from passlib.context import CryptContext

from ..database import Base

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RoleEnum(str, enum.Enum):
    """
    Enum for user roles.
    """
    user = "user"
    admin = "admin"

class User(Base):
    """
    SQLAlchemy model for users.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.user, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    # Relationship to games created by this user
    created_games = relationship("Game", back_populates="creator")
    # Relationship to the user's cart (one-to-one)
    cart = relationship("Cart", back_populates="user", uselist=False)

    # Password hashing methods (migrated from Flask app)
    def set_password(self, password: str):
        """
        Hashes the provided password and stores it.

        Args:
            password: The plain text password.
        """
        self.hashed_password = pwd_context.hash(password)

    def check_password(self, password: str) -> bool:
        """
        Verifies a plain text password against the stored hash.

        Args:
            password: The plain text password to check.

        Returns:
            True if the password matches, False otherwise.
        """
        return pwd_context.verify(password, self.hashed_password)

    # Method to convert model to dictionary (similar to Flask version)
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role.value, # Return enum value
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
            # Do not include hashed_password in dictionary representation
        } 
import uuid  # Import uuid module
from typing import Any

from sqlmodel import Session, select

from app.core.security import get_password_hash
from app.models.model_user import UserItem
from app.schemas.db_user import UserCreateSchema, UserUpdateSchema


class CRUDUser:
    """CRUD operations for UserItem model."""

    def get(self, db: Session, id: Any) -> UserItem | None:
        """
        Retrieve a user by ID.

        Args:
            db (Session): The database session.
            id (Any): The ID of the user to retrieve.

        Returns:
            UserItem | None: The user object if found, otherwise None.
        """
        return db.get(UserItem, id)

    def get_user_by_email(self, db: Session, *, email: str) -> UserItem | None:
        """
        Retrieve a user by email address.

        Args:
            db (Session): The database session.
            email (str): The email address to search for.

        Returns:
            UserItem | None: The user object if found, otherwise None.
        """
        statement = select(UserItem).where(UserItem.email == email)
        return db.exec(statement).first()

    def create(
        self, db: Session, *, obj_in: UserCreateSchema, id: uuid.UUID | None = None
    ) -> UserItem:
        """Create a new user in the database.

        Hashes the password before saving. Allows specifying an ID, otherwise
        the model's default factory is used.

        Args:
            db (Session): The database session.
            obj_in (UserCreateSchema): The user data to create.
            id (uuid.UUID | None, optional): The specific ID to assign. Defaults to None.

        Returns:
            UserItem: The newly created user object.
        """
        create_data = {
            "email": obj_in.email,
            "hashed_password": get_password_hash(obj_in.password),
            "full_name": obj_in.full_name,  # Include full_name
            # Include other fields from UserCreateSchema or defaults as needed
            "is_active": True,  # Assuming default
            "is_superuser": False,  # Assuming default
            "is_admin": False,  # Assuming default
        }
        if id:
            create_data["id"] = id  # Use provided ID if available

        db_obj = UserItem(**create_data)

        db.add(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: UserItem,
        obj_in: UserUpdateSchema | dict[str, Any],
    ) -> UserItem:
        """
        Update an existing user.

        If a password is provided in obj_in, it will be hashed and updated.

        Args:
            db (Session): The database session.
            db_obj (UserItem): The existing user object to update.
            obj_in (UserUpdateSchema | dict[str, Any]): The new data.

        Returns:
            UserItem: The updated user object.
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        if update_data.get("password"):
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password

        # Update model fields
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        return db_obj

    def is_superuser(self, user: UserItem) -> bool:
        """
        Check if a user has superuser privileges.

        Args:
            user (UserItem): The user object.

        Returns:
            bool: True if the user is a superuser, False otherwise.
        """
        return user.is_superuser


user = CRUDUser()

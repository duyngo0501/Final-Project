from collections.abc import Generator

from sqlmodel import Session, create_engine

from app.core.config import settings

# from app.models import User # Remove this import - User model was deleted

# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI), pool_pre_ping=True)


def get_db() -> Generator[Session, None]:
    with Session(engine) as session:
        yield session


def init_db(session: Session) -> None:
    # NOTE: Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables uncommenting the next lines
    # from sqlmodel import SQLModel

    # from app.core.engine import engine
    # def create_db_and_tables():
    # SQLModel.metadata.create_all(engine)

    # user = session.exec(
    #     select(User).where(User.email == settings.FIRST_SUPERUSER)
    # ).first()
    # if not user:
    #     user_in = UserCreate(
    #         email=settings.FIRST_SUPERUSER,
    #         password=settings.FIRST_SUPERUSER_PASSWORD,
    #         is_superuser=True,
    #     )
    #     user = create_user(session=session, user_create=user_in)
    pass # Nothing to do here if using Alembic

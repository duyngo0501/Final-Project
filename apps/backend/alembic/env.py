import os
import sys
from logging.config import fileConfig
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlalchemy import text  # Import text for executing raw SQL if needed

from alembic import context

# First-party model import should be after third-party, but before path manipulation
from app.models.base import InDBBase  # noqa

# Add project root to sys.path
# This ensures alembic can find your models
project_root = Path(__file__).resolve().parents[1]  # Correct path: backend directory
sys.path.insert(0, str(project_root))

# Load environment variables from .env file located in the project root
env_path = project_root / ".env"
load_dotenv(dotenv_path=env_path)

# Adjust the import if your Base is located elsewhere
# Corrected import based on project structure and __init__.py
# from app.models.base import Base # noqa

# This assumes your models are imported somewhere accessible
# For example, in app/models/__init__.py or app/models/base.py
# If not, you might need to explicitly import them here:
# from app.models.user import User  # noqa
# from app.models.item import Item  # noqa

# --- START: Ensure models are registered ---
# Import necessary models and SQLModel base
from sqlmodel import SQLModel  # Make sure SQLModel is imported
import app.models  # Import the package to register models

# Ensure all model modules are imported by app.models.__init__.py
# --- END: Ensure models are registered ---

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the base metadata object - Use the imported correct Base class
target_metadata = SQLModel.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired: my_important_option = config.get_main_option("my_important_option")
# ... etc.


def get_url():
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "postgres")
    server = os.getenv("POSTGRES_SERVER", "db")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "app")
    return f"postgresql://{user}:{password}@{server}:{port}/{db}"


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.
    MODIFIED FOR DEVELOPMENT: Drops and recreates all tables based on current models.
    """
    db_url = get_url()
    engine = engine_from_config(
        {"sqlalchemy.url": db_url},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        # --- START MODIFICATION for DEV MODE ---
        print("Development mode: Dropping all tables...")
        # Drop all tables defined in the metadata
        target_metadata.drop_all(bind=engine)
        # Optionally, handle extensions or specific schemas if needed:
        # with context.begin_transaction():
        #    context.execute(text('DROP SCHEMA public CASCADE; CREATE SCHEMA public;'))
        print("Tables dropped.")

        print("Creating all tables based on models...")
        # Create all tables defined in the metadata
        target_metadata.create_all(bind=engine)
        print("Tables created.")

        # Optional: Stamp the database with the latest revision ID
        # This makes Alembic think migrations are up-to-date.
        # Useful if you have other tools checking alembic status.
        # from alembic.script import ScriptDirectory
        # script = ScriptDirectory.from_config(config)
        # head_revision = script.get_current_head()
        # if head_revision:
        #    with context.begin_transaction():
        #        context.stamp(script, head_revision)
        #    print(f"Stamped database with head revision: {head_revision}")
        # else:
        #    print("No head revision found to stamp.")

        print("Development migration: Database reset complete.")
        # --- END MODIFICATION for DEV MODE ---

        # Comment out the original migration execution for online mode
        # with context.begin_transaction():
        #     context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

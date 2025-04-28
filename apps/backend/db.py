"""Prisma client setup and management."""

from prisma import Prisma

# Global Prisma client instance
# It's generally recommended to use a single instance
# See: https://prisma-client-py.readthedocs.io/en/stable/reference/lifecycle/
prisma = Prisma(auto_register=True)


async def connect_db():
    """Connect the Prisma client."""
    print("Connecting to database...")
    await prisma.connect()
    print("Database connection established.")


async def disconnect_db():
    """Disconnect the Prisma client."""
    print("Disconnecting from database...")
    await prisma.disconnect()
    print("Database connection closed.")


# Dependency function to get the Prisma client instance
# Since we are using a global instance, this is straightforward.
# If you needed request-scoped instances, the logic would be different.
async def get_db() -> Prisma:
    """FastAPI dependency that provides the Prisma client instance.

    Returns:
        Prisma: The initialized Prisma client.
    """
    # Ensure the client is connected (idempotent check)
    if not prisma.is_connected():
        await prisma.connect()
    return prisma


def init_db() -> None:
    """Initializes the database (placeholder).

    Note: Database schema creation and migrations should be handled by
          `prisma migrate dev` or `prisma db push`.
    """
    # Prisma handles initialization via migrations.
    print("Database initialization function `init_db` called (no-op for Prisma).")
    pass

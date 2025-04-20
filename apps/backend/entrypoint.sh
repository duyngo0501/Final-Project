#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Run database migrations
echo "Running DB migrations..."
alembic upgrade head

# Execute the command passed as arguments to this script (the Dockerfile CMD)
echo "Starting application..."
exec "$@" 
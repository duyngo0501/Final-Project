#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

echo "Running Prisma migrations before starting server..."

# Apply migrations. Add --skip-seed if needed.
# The --name flag provides a default name if a new migration is created.
prisma migrate dev --name auto_migration_on_startup

echo "Migrations applied. Starting FastAPI development server..."

# Start the FastAPI server using Uvicorn
# Make sure this command matches how you usually start it (host, port, reload, log-config etc.)
# You might need to adjust this based on your package.json or turbo.json
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-config logging.ini 
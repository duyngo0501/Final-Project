# Use an official Python runtime as a parent image
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Force colored terminal output
ENV FORCE_COLOR=1

# Install system dependencies required for psycopg and potentially other C extensions
# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install uv by copying the binary from the official image
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
COPY --from=ghcr.io/astral-sh/uv /uv /usr/local/bin/uv

# Set the working directory in the container
WORKDIR /app

# Copy dependency definition files
COPY pyproject.toml uv.lock ./

# Install project dependencies using uv pip install
# Use --system to install packages into the global site-packages
# Use --no-cache to reduce image size
# Install '.' (the current project) which should use pyproject.toml and uv.lock
RUN uv pip install --system --no-cache .

# Copy the rest of the application code into the container
# This should come *after* installing dependencies to leverage Docker layer caching
COPY . .

# Copy and set the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the application (this will be passed to entrypoint.sh)
# For development with reload:
CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
# For production (no reload):
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

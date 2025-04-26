# Dockerfile for Backend Service

# 1. Use an official Python runtime as a parent image
# Using slim-buster for a smaller image size. Adjust version as needed.
FROM python:3.11-slim-buster AS base

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# --- Builder Stage ---
# Used for installing dependencies
FROM base AS builder

# Install uv (Python package installer)
RUN pip install uv

# Copy only the necessary files for dependency installation
COPY pyproject.toml poetry.lock* ./
# Or if using requirements.txt:
# COPY requirements.txt ./

# Install dependencies using uv
# Using --system to install globally in the image
RUN uv pip install --system --no-cache .

# --- Final Stage ---
# Use the base image again for the final application image
FROM base

# Copy the installed dependencies from the builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Copy the application code
COPY . .

# Expose the port the app runs on (adjust if different)
EXPOSE 8000

# Command to run the application using Uvicorn
# Adjust the module path (app.main:app) and port if necessary
# Add --reload flag for development if desired, but remove for production
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

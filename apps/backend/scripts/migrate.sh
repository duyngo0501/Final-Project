#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# You can adjust the default migration message prefix if desired
MESSAGE_PREFIX=""

# --- Script Logic ---

echo "---> Checking Alembic setup..."
# Try a simple command to ensure alembic is configured and can connect (partially)
alembic current > /dev/null
echo "---> Alembic check passed."

echo
# Prompt for a migration message
read -p "Enter migration message (e.g., 'Add CartItem model'): " migration_message

# Check if message is empty
if [ -z "$migration_message" ]; then
    echo "Error: Migration message cannot be empty." >&2
    exit 1
fi

full_message="${MESSAGE_PREFIX}${migration_message}"

echo
echo "---> Generating migration: '$full_message'" 
alembic revision --autogenerate -m "$full_message"

echo
echo "*** IMPORTANT: Review the generated migration script in alembic/versions/ before proceeding! ***" 
echo

# Ask for confirmation before applying
read -p "Apply this migration? (y/N): " apply_confirmation

if [[ "$apply_confirmation" =~ ^[Yy]$ ]]; then
    echo
    echo "---> Applying migration..."
    alembic upgrade head
    echo "---> Migration applied successfully!"
else
    echo "---> Upgrade aborted by user." 
    exit 0
fi

echo
echo "---> Done." 
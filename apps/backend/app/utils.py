"""General utility functions."""

import uuid

# Use starlette's Request for type hinting as FastAPI uses it under the hood
# and it avoids circular dependency issues if utils are imported elsewhere.
from starlette.requests import Request


def custom_generate_unique_id(route_request: Request) -> str:
    """Generates a unique ID for each request.

    FastAPI uses this function (if provided) to generate operation IDs
    visible in the OpenAPI schema, which can be useful for client generation
    or logging.

    Args:
        route_request: The incoming request object.

    Returns:
        A unique string identifier for the request.
    """
    # Example: Prefixing a standard UUID4 hex string
    # You could customize this further, e.g., include timestamp or route info
    # Be mindful of potential collisions if the logic isn't robustly unique.
    return f"req_{uuid.uuid4().hex}"

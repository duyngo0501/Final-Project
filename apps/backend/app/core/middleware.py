"""Custom FastAPI middleware definitions.

Includes middleware for handling exceptions and providing tracebacks.
"""

import traceback

from fastapi import Request
from fastapi.responses import PlainTextResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response


class TracebackMiddleware(BaseHTTPMiddleware):
    """Middleware for capturing unhandled exceptions and returning tracebacks.

    Catches exceptions during request processing and returns a 500 response
    with the full Python traceback as plain text. Useful for debugging.

    Note:
        Consider enabling this middleware only in development environments
        to avoid exposing sensitive information in production.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """Processes the request and handles potential exceptions.

        Args:
            request: The incoming Starlette request object.
            call_next: The next middleware or endpoint in the call chain.

        Returns:
            The response from the next middleware/endpoint, or a
            PlainTextResponse containing the traceback if an exception occurred.
        """
        try:
            response = await call_next(request)
            return response
        except Exception:
            traceback_str = traceback.format_exc()
            print(f"Unhandled exception during request: {request.url}\n{traceback_str}")
            return PlainTextResponse(traceback_str, status_code=500)

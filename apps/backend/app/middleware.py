"""Custom FastAPI middleware definitions.

Includes middleware for handling exceptions and providing tracebacks.
"""

import traceback

from fastapi import Request, HTTPException
from fastapi.responses import PlainTextResponse, JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response


class TracebackMiddleware(BaseHTTPMiddleware):
    """Middleware for capturing ALL exceptions and returning tracebacks.

    Catches exceptions during request processing.
    - For HTTPErrors, returns JSON with original detail + traceback.
    - For other Exceptions, returns 500 PlainText with traceback.

    Note:
        Returning tracebacks for all errors (including 4xx) is useful for
        debugging but NOT recommended for production.
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
            custom response containing the traceback if an exception occurred.
        """
        traceback_str = ""
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            traceback_str = traceback.format_exc()
            print(f"Exception during request: {request.url}\n{traceback_str}")

            if isinstance(exc, HTTPException):
                return JSONResponse(
                    status_code=exc.status_code,
                    content={"detail": exc.detail, "traceback": traceback_str},
                    headers=getattr(exc, "headers", None),
                )
            else:
                return PlainTextResponse(traceback_str, status_code=500)

import traceback

from fastapi import Request
from fastapi.responses import PlainTextResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response


class TracebackMiddleware(BaseHTTPMiddleware):
    """
    Middleware to catch all unhandled exceptions and return a plain text response
    with the full traceback for debugging purposes.
    """
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            traceback_str = traceback.format_exc()
            print(f"Unhandled exception: {traceback_str}") # Optional: log to server console
            return PlainTextResponse(traceback_str, status_code=500) 
from __future__ import annotations

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from urllib.parse import urlparse

from .routes import Application


APP = Application()


class TradexRequestHandler(BaseHTTPRequestHandler):
    server_version = "TradexAI/1.0"

    def do_GET(self) -> None:
        self._dispatch()

    def do_POST(self) -> None:
        self._dispatch()

    def _dispatch(self) -> None:
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(content_length) if content_length else None
        response = APP.route_request(
            method=self.command,
            path=parsed.path,
            query_string=parsed.query,
            body=body,
            headers={key: value for key, value in self.headers.items()},
        )
        payload = json.dumps(response.payload).encode("utf-8")
        self.send_response(response.status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def log_message(self, format: str, *args) -> None:
        return


def run() -> None:
    host = os.environ.get("TRADEX_HOST", "127.0.0.1")
    port = int(os.environ.get("TRADEX_PORT", "8000"))
    server = ThreadingHTTPServer((host, port), TradexRequestHandler)
    print(f"Tradex AI backend listening on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()


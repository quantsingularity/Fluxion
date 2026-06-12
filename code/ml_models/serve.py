"""
Minimal HTTP server for the Fluxion ML service.

The ml_models package is otherwise a library (training/inference code with no
network entry point), but docker-compose defines an `ml-service` that expects:
  - an HTTP health endpoint on PORT (default 8000) at /health
  - a Prometheus metrics endpoint on METRICS_PORT (default 9091) at /metrics

This server provides both with no third-party web framework, so the container
can report healthy and be scraped. Extend the /predict handler to wire in the
actual model inference (see anomaly_detection.py / forecasting_models.py).
"""

import json
import logging
import os
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "info").upper(),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("ml-service")

PORT = int(os.environ.get("PORT", "8000"))
METRICS_PORT = int(os.environ.get("METRICS_PORT", "9091"))
MODEL_PATH = os.environ.get("MODEL_PATH", "/app/models")

# Simple in-process counters exposed at /metrics.
_metrics = {
    "ml_health_requests_total": 0,
    "ml_predict_requests_total": 0,
}
_metrics_lock = threading.Lock()


def _bump(key):
    with _metrics_lock:
        _metrics[key] += 1


class HealthHandler(BaseHTTPRequestHandler):
    def _send_json(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            _bump("ml_health_requests_total")
            models_present = os.path.isdir(MODEL_PATH)
            self._send_json(
                200, {"status": "healthy", "models_path_present": models_present}
            )
        elif self.path == "/":
            self._send_json(200, {"service": "fluxion-ml", "status": "ok"})
        else:
            self._send_json(404, {"error": "not found"})

    def do_POST(self):
        if self.path == "/predict":
            _bump("ml_predict_requests_total")
            # Inference is not wired up here; this is a stub that returns 501 so
            # callers get a clear signal rather than a silent wrong answer.
            self._send_json(501, {"error": "prediction endpoint not implemented yet"})
        else:
            self._send_json(404, {"error": "not found"})

    def log_message(self, fmt, *args):
        logger.info("%s - %s", self.address_string(), fmt % args)


class MetricsHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/metrics":
            with _metrics_lock:
                lines = []
                for key, value in _metrics.items():
                    lines.append(f"# TYPE {key} counter")
                    lines.append(f"{key} {value}")
            body = ("\n".join(lines) + "\n").encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; version=0.0.4")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, fmt, *args):
        pass


def _serve(server):
    server.serve_forever()


def main():
    health_server = ThreadingHTTPServer(("0.0.0.0", PORT), HealthHandler)
    metrics_server = ThreadingHTTPServer(("0.0.0.0", METRICS_PORT), MetricsHandler)

    logger.info("ML health server listening on :%d", PORT)
    logger.info("ML metrics server listening on :%d", METRICS_PORT)

    metrics_thread = threading.Thread(
        target=_serve, args=(metrics_server,), daemon=True
    )
    metrics_thread.start()

    try:
        health_server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down ML service")
    finally:
        health_server.shutdown()
        metrics_server.shutdown()


if __name__ == "__main__":
    main()

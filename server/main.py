import asyncio
import threading
from system import setup_v4l2 # Importing system module for openApp and setup_v4l2 functions
from webcam import main_async  # Importing main_async from webcam module
from dock_server import start_http_server  # Importing start_http_server from dock_server module


if __name__ == "__main__":
    setup_v4l2()
    HOST = "192.168.1.153"
    HTTP_PORT = 8000

    http_thread = threading.Thread(
        target=start_http_server, args=(HOST, HTTP_PORT), daemon=True
    )
    http_thread.start()
    try:
        print("HTTP Server is running.")
        asyncio.run(main_async())
    except KeyboardInterrupt:
        print("Stopping all servers.")

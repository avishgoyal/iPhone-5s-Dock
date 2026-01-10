# Main File for HTTP Server for iPhone 5s Dock

#imports
from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import time
import ssl
import json
from system import openApp

#Modifying BaseHTTPRequestHandler to handle GET and POST requests
last_launched = {}
class DockHTTP(BaseHTTPRequestHandler):
    #do_GET method to serve static files
    def do_GET(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        clean_path = self.path.lstrip("/")

        if self.path == "/":
            filepath = os.path.join(base_dir, "web", "index.html")
        else:
            filepath = os.path.join(base_dir, "web", clean_path)

        if filepath.endswith(".html"):
            content_type = "text/html"
        elif filepath.endswith(".css"):
            content_type = "text/css"
        elif filepath.endswith(".js"):
            content_type = "application/javascript"
        else:
            content_type = "text/plain"

        try:
            with open(filepath, "rb") as file:
                content = file.read()
                self.send_response(200)
                self.send_header("Content-type", content_type)
                self.end_headers()
                self.wfile.write(content)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    #do_POST method to handle icon launch requests
    def do_POST(self):
        content_length = int(self.headers["Content-Length"])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        icon_name = data.get("icon", "Unknown")
        current_time = time.time()
        previous_time = last_launched.get(icon_name, 0)
        if self.path == "/icon":
            if current_time - previous_time > 3:
                openApp(icon_name)
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"Icon received")
                last_launched[icon_name] = current_time
            else:
                print("Cooldown active, ignoring request.")
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"Cooldown active")
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")

# Function to start the HTTP server
def start_http_server(HOST, PORT):
    server = HTTPServer((HOST, PORT), DockHTTP)
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")
    # Legacy support for iPhone 5s (forces TLS 1.2)
    ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2
    ssl_context.maximum_version = ssl.TLSVersion.TLSv1_2

    server.socket = ssl_context.wrap_socket(server.socket, server_side=True)
    print(f"Starting SECURE server at https://{HOST}:{PORT}")
    server.serve_forever()


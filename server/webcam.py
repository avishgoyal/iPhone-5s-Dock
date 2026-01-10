# Webcam related utilities and functions
import asyncio
import cv2
import numpy as np
import pyvirtualcam
import websockets
import ssl



#Main Webcam Handler For Camera Streaming
async def webcam_handler(websocket):
    print("WebSocket connection established")
    try:
        with pyvirtualcam.Camera(
            width=640,
            height=480,
            fps=24,
            fmt=pyvirtualcam.PixelFormat.BGR,
            device="/dev/video10",
        ) as cam:
            print(f"Virtual Cam Active: {cam.device}")
            async for message in websocket:
                nparr = np.frombuffer(message, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if frame is not None:
                    if frame.shape[1] != 640 or frame.shape[0] != 480:
                        frame = cv2.resize(frame, (640, 480))

                    cam.send(frame)
                    cam.sleep_until_next_frame()
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        break
                else:
                    print("Received empty frame")
    except websockets.exceptions.ConnectionClosed:
        print("WebSocket connection closed")
    except Exception as e:
        print(f"Error in webcam handler: {e}")
    finally:
        cv2.destroyAllWindows()



#Main Async Function For Websocket Webcam Streaming
async def main_async():
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")
    ssl_context.options |= ssl.OP_NO_TLSv1_3

    ssl_context.minimum_version = ssl.TLSVersion.TLSv1
    ssl_context.options &= ~ssl.OP_NO_TLSv1  # Enable TLS 1.0/1.1 if needed
    ssl_context.options &= ~ssl.OP_NO_TLSv1_1  # Enable TLS 1.0/1.1 if needed
    async with websockets.serve(webcam_handler, "0.0.0.0", 8001, ssl=ssl_context):
        await asyncio.Future()  # run forever

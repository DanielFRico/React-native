import asyncio
import websockets
import cv2
from io import BytesIO

async def generate_and_send_images():
    uri = "ws://localhost:8082"
    
    video_file_path = "./example.mp4" # Replace with the path to your video file
    cap = cv2.VideoCapture(video_file_path)

    async with websockets.connect(uri) as websocket:
        while True:
            ret, frame = cap.read()

            # If the video ends, reset the video capture to the beginning
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue

            # Resize the frame
            frame = cv2.resize(frame, (640, 360))

            # Encode the image as a JPEG
            is_success, buffer = cv2.imencode(".jpg", frame)
            if not is_success:
                print("Error encoding image")
                continue

            # Send the binary image data over the WebSocket
            await websocket.send(buffer.tobytes())

            # Wait for 1/30 of a second (assuming 30 FPS)
            await asyncio.sleep(1 / 30)

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(generate_and_send_images())

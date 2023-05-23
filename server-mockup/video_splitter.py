import cv2
from pathlib import Path
from PIL import Image

# Open the video file
video_path = "data/example.mp4"
cap = cv2.VideoCapture(video_path)

# Get the frame rate of the video
frame_rate = cap.get(cv2.CAP_PROP_FPS)
print(f"Frame rate: {frame_rate}")

# Define the desired size for the resized images
new_size = (360, 720)

# Define the output directory for the image frames
output_dir = Path("data/video-frames")
output_dir.mkdir(exist_ok=True)

# Loop through the video frames and save each one as an image
frame_count = 0
while True:
    # Read the next frame from the video
    ret, frame = cap.read()
    
    # If we've reached the end of the video, break the loop
    if not ret:
        break
    
    # Increment the frame count
    frame_count += 1
    
    # Resize the frame
    img_resized = cv2.resize(frame, new_size)
    
    # Save the resized frame as an image
    output_path = output_dir / f"frame_{frame_count:05d}.jpg"
    img = Image.fromarray(img_resized)
    img.save(output_path)

# Release the video capture object
cap.release()

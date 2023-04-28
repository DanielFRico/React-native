import subprocess
import time
from pathlib import Path
from PIL import Image, ImageOps
import io

def load_images(images_paths):
    loaded_images = []
    for img_path in images_paths:
        img = Image.open(img_path).convert('YCbCr')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="JPEG")
        loaded_images.append(img_bytes.getvalue())
    return loaded_images


def main():
    ROOT = Path(__file__).parent
    current_image_index = 0
    images_paths = []

    for i in range(1, 82):
        image_index = str(i).zfill(5)
        images_paths.append(ROOT / f"data/video-frames/frame_{image_index}.jpg")

    images = load_images(images_paths)

    width, height = 640, 480
    fps = 30
    sleep_time = 1 / fps

    ffmpeg_cmd = [
        "ffmpeg",
        "-re",
        "-v", "info",
        "-f", "image2pipe",
        "-vcodec", "mjpeg",
        "-s", f"{width}x{height}",
        "-pix_fmt", "yuvj420p",  # Add this line
        "-r", str(fps),
        "-i", "-",
        "-map", "0:v:0",
        "-pix_fmt", "yuv420p",
        "-c:v", "libvpx",
        "-b:v", "1000k",
        "-deadline", "realtime",
        "-cpu-used", "4",
        "-f", "tee",
        "[select=v:f=rtp:ssrc=22222222:payload_type=102]rtp://100.100.2.179:32258?rtcpport=32257"
    ]

    process = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

    try:
        while True:
            img_bytes = images[current_image_index]
            process.stdin.write(img_bytes)
            time.sleep(sleep_time)

            current_image_index += 1
            if current_image_index >= len(images):
                current_image_index = 0
    except KeyboardInterrupt:
        process.stdin.close()
        process.wait()

if __name__ == "__main__":
    main()

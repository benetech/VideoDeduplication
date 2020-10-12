import datetime
import os
import subprocess
import tempfile


def extract_frame(source_path, position=0, destination=None, compression=2, width=320):
    """Extract single frame from the given video file using ffmpeg utility.

    Args:
        source_path (str): Path to the video file from which to extract the frame.
        position (int): Time position of the frame inside video (in seconds).
        destination (str): Path of the destination image file. If None a file in temporary location will be created.
        compression (int): JPEG compression (normal range is 2-31 with 31 being the worst quality).
        width (int): Scaled frame width.
    """
    # Create a temporary destination file if needed
    if destination is None:
        file, path = tempfile.mkstemp(suffix=".jpg")
        os.close(file)
        destination = path

    # Get frame position timestamp as hh:mm:ss
    timestamp = str(datetime.timedelta(seconds=position))

    command = [
        "ffmpeg",

        # -ss position
        # When used as an input option (before -i), seeks in this input file to position.
        # Note that in most formats it is not possible to seek exactly, so ffmpeg will seek
        # to the closest seek point before position. See https://ffmpeg.org/ffmpeg.html#Main-options
        "-ss", timestamp,

        # Input file path
        "-i", source_path,

        # -frames[:stream_specifier] framecount
        # Set the number of frames to output. See https://ffmpeg.org/ffmpeg.html#Main-options
        "-frames:v", "1",

        # -q[:stream_specifier] q
        # Use fixed quality scale (VBR). The meaning of q/qscale is codec-dependent. 'v' means video stream.
        # Normal range for JPEG is 2-31 with 31 being the worst quality.
        # See https://ffmpeg.org/ffmpeg.html#Main-options
        "-q:v", str(compression),

        # Scale the image to a particular width
        # See https://ffmpeg.org/faq.html#I-have-a-stretched-video_002c-why-does-scaling-does-not-fix-it_003f
        # See https://ffmpeg.org/ffmpeg.html#Simple-filtergraphs
        "-vf", f"scale={width}:-1",

        # Force the JPEG encoding.
        # See https://ffmpeg.org/faq.html#How-do-I-encode-movie-to-single-pictures_003f
        "-c:v", "mjpeg",

        # Overwrite output files without asking.
        "-y",

        # Destination file path
        destination
    ]

    subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return destination

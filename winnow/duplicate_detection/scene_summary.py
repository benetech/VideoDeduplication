from __future__ import print_function
from scenedetect.video_manager import VideoManager
from scenedetect.scene_manager import SceneManager
from scenedetect.stats_manager import StatsManager
from scenedetect.detectors import ContentDetector
from PIL import Image
from moviepy.editor import VideoFileClip
import numpy as np

STATS_FILE_PATH = "testvideo.stats.csv"


def get_scene_list(filename):
    # Create a video_manager point to video file testvideo.mp4. Note that
    # multiple videos can be appended by simply specifying more file
    # paths in the list passed to the VideoManager constructor. Note that
    # appending multiple videos requires that they all have the same frame
    # size, and optionally, framerate.
    video_manager = VideoManager([filename])
    stats_manager = StatsManager()
    scene_manager = SceneManager(stats_manager)
    # Add ContentDetector algorithm
    # (constructor takes detector options like threshold).
    scene_manager.add_detector(ContentDetector())
    base_timecode = video_manager.get_base_timecode()

    try:

        start_time = base_timecode + 20  # 00:00:00.667
        end_time = base_timecode + 20.0  # 00:00:20.000
        # Set video_manager duration to read frames from 00:00:00 to 00:00:20.
        video_manager.set_duration(start_time=start_time, end_time=end_time)

        # Set downscale factor to improve processing speed
        # (no args means default).
        video_manager.set_downscale_factor()

        # Start video_manager.
        video_manager.start()

        # Perform scene detection on video_manager.
        scene_manager.detect_scenes(frame_source=video_manager)

        # Obtain list of detected scenes.
        scene_list = scene_manager.get_scene_list(base_timecode)
        # Like FrameTimecodes, each scene in the scene_list can be
        # sorted if the list of scenes becomes unsorted.
        print(scene_list)
        return scene_list

    finally:

        video_manager.release()


def get_video_summary(filename):
    clip = VideoFileClip(filename)
    scenes = get_scene_list(filename)
    frame_list = [x[0].frame_num for x in scenes]
    frames = [Image.fromarray(f).resize((120, 120)) for i, f in enumerate(clip.iter_frames()) if i in frame_list]
    return np.hstack(frames)


def get_video_summary_list(list_of_videos):

    scenes_descriptors = [get_scene_list(x) for x in list_of_videos]
    scenes_descriptors = sorted(scenes_descriptors, key=lambda x: len(x))
    main_scenes = scenes_descriptors[-1]
    frame_list = [x[0].frame_num for x in main_scenes]
    summaries = []
    for vid in list_of_videos:
        clip = VideoFileClip(vid)
        frames = [Image.fromarray(f).resize((120, 120)) for i, f in enumerate(clip.iter_frames()) if i in frame_list]
        summaries.append(np.hstack(frames))

    return summaries

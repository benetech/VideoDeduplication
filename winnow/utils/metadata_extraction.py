import logging
import math
import os
import shlex
import subprocess
from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict

import cv2
import numpy as np
import pandas as pd
from pandas import json_normalize

from winnow.pipeline.progress_monitor import BaseProgressMonitor, ProgressMonitor

logger = logging.getLogger(__name__)


def find_video_metadata_mediainfo(path_to_input_video):
    """Assumes the mediainfo cli is installed and runs it on the input video

    Args:
        path_to_input_video ([String]): Path to input video

    Returns:
        [String]: Text output from running the mediainfo command
    """
    mi = "mediainfo -f --Language=raw"
    cmd = "{} {}".format(mi, shlex.quote(path_to_input_video))
    args = shlex.split(cmd)
    media_info_output = subprocess.check_output(args).decode("utf-8")
    return media_info_output


def process_media_info(info):
    lines = info.split("\n")
    section = None
    metadata = defaultdict(dict)

    for line in lines:
        if ":" not in line:
            section = line
        else:
            key, val = line.split(":", maxsplit=1)
            section, key = section.strip(), key.strip()
            metadata[section][key] = val.lstrip()
    return dict(metadata)


def get_duration(fp):

    cap = cv2.VideoCapture(fp)
    fps = max(0, cap.get(cv2.CAP_PROP_FPS))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if fps == 0:
        fps = 25

    duration = frame_count / fps

    if duration < 0:
        count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if isinstance(frame, np.ndarray):
                try:
                    if int(count % round(fps)) == 0:
                        count += 1
                except Exception as exc:
                    logging.error("Problems processing file '%s': %s", fp, exc)

            else:
                break

        duration = count / fps

    cap.release()

    return duration * 1000


def normalize_duration(metadata, file_path):

    cond1 = "Duration" not in metadata["General"]
    cond2 = int(metadata["General"]["Duration"]) < 0

    if (cond1) or (cond2):

        duration = get_duration(file_path)
        metadata["General"]["Duration"] = duration

    return metadata


def extract_from_list_of_videos(video_files, progress: BaseProgressMonitor = ProgressMonitor.NULL):
    """Processes a list of video files and returns a list of dicts containing the mediainfo output for each file

    Args:
        video_files ([List[Strings]]): List of file paths to video files
        progress: progress monitor
    """
    progress.scale(total_work=len(video_files), unit="files")
    video_metadata = []
    for file_path in video_files:
        try:
            raw_metadata = find_video_metadata_mediainfo(file_path)
            metadata = process_media_info(raw_metadata)
            metadata = normalize_duration(metadata, file_path)
            metadata = ensure_encoded_date_exists(metadata, file_path)
            video_metadata.append(metadata)
        except Exception as exc:
            logging.info("Problems processing file '%s': %s", file_path, exc)
            video_metadata.append({"General": {"FileName": os.path.basename(file_path)}})
        progress.increase(1)
    progress.complete()
    return video_metadata


def ensure_encoded_date_exists(metadata: Dict, file_path: str) -> Dict:
    """Ensure encoded date exists on each file."""
    if "General" not in metadata or "Encoded_Date" not in metadata["General"]:
        time = datetime.fromtimestamp(min(os.path.getmtime(file_path), os.path.getctime(file_path)))
        timestamp = time.strftime(f"UTC {_EXIF_DATE_FORMAT}")
        metadata.setdefault("General", {}).setdefault("Encoded_Date", timestamp)
    return metadata


def convert_to_df(video_metadata):

    df = json_normalize(video_metadata)
    df.columns = [x.strip().replace(".", "_").replace("(s)", "s") for x in df.columns]

    return df


# Columns of interest
CI = [
    "General_FileName",
    "General_FileExtension",
    "General_Format_Commercial",
    "General_FileSize",
    "General_Duration",
    "General_OverallBitRate_Mode",
    "General_OverallBitRate",
    "General_FrameRate",
    "General_FrameCount",
    "General_Encoded_Date",
    "General_File_Modified_Date",
    "General_File_Modified_Date_Local",
    "General_Tagged_Date",
    "Video_Format",
    "Video_BitRate",
    "Video_InternetMediaType",
    "Video_Width",
    "Video_Height",
    "Video_FrameRate",
    "Audio_Format",
    "Audio_SamplingRate",
    "Audio_Title",
    "Audio_BitRate",
    "Audio_Channels",
    "Audio_Duration",
    "Audio_Encoded_Date",
    "Audio_Tagged_Date",
]

# Numerical columns of interest
NCI = [
    "General_FileSize",
    "General_Duration",
    "General_OverallBitRate",
    "General_FrameRate",
    "General_FrameCount",
    "Video_BitRate",
    "Video_Width",
    "Video_Height",
    "Video_FrameRate",
    "Audio_SamplingRate",
    "Audio_BitRate",
    "Audio_Channels",
    "Audio_Duration",
]

# Date column of interest
DCI = [
    "General_Encoded_Date",
    "General_Tagged_Date",
    "General_File_Modified_Date",
    "General_File_Modified_Date_Local",
    "Audio_Encoded_Date",
    "Audio_Tagged_Date",
]

# Exif date format
_EXIF_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def parse_timezone(str_value):
    if str_value.startswith("UTC"):
        return timezone.utc, str_value[3:].lstrip()
    return None, str_value


def parse_date(raw_value):
    try:
        # After being processed by pandas.json_normalize
        # the metadata may contain NaNs in place of missing
        # values. See examples in pandas.json_normalize:
        # https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.json_normalize.html
        if raw_value is None or isinstance(raw_value, float) and math.isnan(raw_value):
            return None
        time_zone, date_time = parse_timezone(raw_value)
        return datetime.strptime(date_time, _EXIF_DATE_FORMAT).replace(tzinfo=time_zone)
    except ValueError:
        logger.error(f"Cannot parse date: {raw_value}")
        return None


def parse_date_series(series):
    # pandas.Series heuristically determines type of
    # the underlying data and tries to represent a
    # missing values according to that data time.
    # In case of datetime the missing values are
    # represented by pandas.NaT which is not compatible
    # with SQLAlchemy framework. To fix that we
    # have to explicitly transform NaTs to Nones.
    # See https://pandas.pydata.org/pandas-docs/stable/user_guide/missing_data.html#datetimes
    parsed = series.apply(parse_date)
    return parsed.astype(object).where(pd.notnull(parsed), other=None)


def parse_and_filter_metadata_df(metadata_df, full_metadata):
    all_columns = [column_name for column_name in CI if column_name in metadata_df.columns]
    numeric_columns = [column_name for column_name in NCI if column_name in metadata_df.columns]
    date_columns = [column_name for column_name in DCI if column_name in metadata_df.columns]

    filtered = metadata_df.loc[:, all_columns]
    filtered["Json_full_exif"] = full_metadata

    # Parsing numerical fields
    filtered.loc[:, numeric_columns] = filtered.loc[:, numeric_columns].apply(
        lambda x: pd.to_numeric(x, errors="coerce")
    )

    # Parsing date fields
    filtered.loc[:, date_columns] = filtered.loc[:, date_columns].apply(parse_date_series)

    # Convert NaN values into None / Null

    filtered = filtered.where(pd.notnull(filtered), None)

    return filtered

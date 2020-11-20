import os
import shutil
import yaml
import cv2
import numpy as np
import requests


def download_file(local_filename, url):

    with requests.get(url, stream=True) as r:

        r.raise_for_status()
        with open(local_filename, 'wb') as f:

            for chunk in r.iter_content(chunk_size=8192):

                if chunk:

                    f.write(chunk)

        return local_filename


def load_video(video, desired_size, frame_sampling):
    """
      Function that loads a video and converts it to the desired size.

      Args:
        video: path to video
        desired_size: desired shape of each frame

      Returns:
        video_tensor: the tensor of the given video
cfg['pretrained_model_local_path']
      Raise:
        Exception: if provided video can not be load
    """
    try:
        cap = cv2.VideoCapture(video)
        frames = []
        count = 0
        fps = cap.get(cv2.CAP_PROP_FPS)

        if not fps or fps != fps or fps == np.inf:
            fps = 25
        while cap.isOpened():
            ret, frame = cap.read()
            if isinstance(frame, np.ndarray):
                try:
                    """
                    When frame_sampling = 1 -> We sample one 1
                    frame per second
                    When frame_sampling = 2 -> We sample one
                    frame every 2 * frame_per_second -> 1 frame
                    every 2 seconds
                    """
                    if int(count % round(fps * frame_sampling)) == 0:
                        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        if desired_size != 0:
                            frame = pad_and_resize(frame, desired_size)
                        frames.append(frame)
                except Exception:
                    pass
            else:
                break
            count += 1
        cap.release()
        video_tensor = np.array(frames)

        return video_tensor
    except Exception as e:
        raise Exception('Can\'t load video {}\n{}'.format(video, e))


def load_image(image, desired_size):
    """
      Function that loads an image and converts it to the desired size.

      Args:
        image: path to image
        desired_size: desired shape of the image

      Returns:
        image_tensor: the tensor of the given image
cfg['pretrained_model_local_path']
      Raise:
        Exception: if provided image can not be load
    """
    try:
        image_tensor = cv2.imread(image)
        image_tensor = cv2.cvtColor(image_tensor, cv2.COLOR_BGR2RGB)
        if desired_size != 0:
            img = pad_and_resize(image_tensor, desired_size)
        return img
    except Exception as e:
        raise Exception('Can\'t load image {}\n{}'.format(image, e.message))


def pad_and_resize(image, desired_size):
    """
      Function that converts an image to the desired size.

      Args:
        image: image tensor
        desired_size: desired shape of the image

      Returns:
        image_processed: the processed tensor of the given image
    """
    # reshape based on aspect ratio
    old_size = image.shape[:2]
    ratio = float(desired_size) / max(old_size)
    image_processed = cv2.resize(
        image, dsize=(0, 0), fx=ratio, fy=ratio, interpolation=cv2.INTER_CUBIC)

    # zero padding to meet the desired dimensions
    new_size = image_processed.shape[:2]
    delta_h = desired_size - new_size[0]
    delta_w = desired_size - new_size[1]
    top, bottom = delta_h // 2, delta_h - (delta_h // 2)
    left, right = delta_w // 2, delta_w - (delta_w // 2)

    image_processed = cv2.copyMakeBorder(
        image_processed,
        top,
        bottom,
        left,
        right,
        cv2.BORDER_CONSTANT,
        value=[0, 0, 0])

    return image_processed


def download_pretrained(config_file):
    hit_exc = False
    try:

        CONFIG_FP = config_file
        with open(CONFIG_FP, 'r') as ymlfile:
            cfg = yaml.load(ymlfile)

        USE_LOCAL_PRETRAINED = cfg['use_pretrained_model_local_path']
        PRETRAINED_LOCAL_PATH = cfg['pretrained_model_local_path']
        DST_DIR = cfg['destination_folder']

    except Exception:
        hit_exc = True
        print("Make sure path to config has been added to env")

    finally:

        if hit_exc:

            USE_LOCAL_PRETRAINED = False
            DST_DIR = False

    if not USE_LOCAL_PRETRAINED:

        PRETRAINED_MODEL = 'vgg_16.ckpt'

        if DST_DIR:

            PRETRAINED_LOCAL_PATH = os.path.join(
                                                DST_DIR,
                                                'pretrained_models',
                                                PRETRAINED_MODEL)

        else:
            package_directory = os.path.dirname(os.path.abspath(__file__))
            PRETRAINED_LOCAL_PATH = os.path.join(
                                                package_directory,
                                                'pretrained_models',
                                                PRETRAINED_MODEL)

    # Pre-trained model file availability assessment

    if os.path.exists(PRETRAINED_LOCAL_PATH):
        print('Pretrained Model Found')
    else:
        if USE_LOCAL_PRETRAINED:
            try:
                print('Downloading pretrained model to:{}'.format(
                        PRETRAINED_LOCAL_PATH))
                download_file(
                            PRETRAINED_LOCAL_PATH,
                            "https://s3.amazonaws.com/winnowpretrainedmodels/vgg_16.ckpt"
                            )
            except Exception:
                print('Copying from source dir')

                raise
        else:
            try:
                os.makedirs(os.path.join(
                                        package_directory,
                                        'pretrained_models'))
            except Exception as e:
                print(e)
                pass
            print('Downloading pretrained model to:{}'.format(
                                        PRETRAINED_LOCAL_PATH))

            download_file(
                          PRETRAINED_LOCAL_PATH,
                          "https://s3.amazonaws.com/winnowpretrainedmodels/vgg_16.ckpt")

    return PRETRAINED_LOCAL_PATH

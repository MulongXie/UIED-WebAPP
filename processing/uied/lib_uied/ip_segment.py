import cv2
import numpy as np
import os
from os.path import join as pjoin


def segment_img(org, segment_size, output_path, overlap=100):
    if not os.path.exists(output_path):
        os.mkdir(output_path)

    height, width = np.shape(org)[0], np.shape(org)[1]
    top = 0
    bottom = segment_size
    segment_no = 0
    while top < height and bottom < height:
        segment = org[top:bottom]
        cv2.imwrite(os.path.join(output_path, str(segment_no) + '.png'), segment)
        segment_no += 1
        top += segment_size - overlap
        bottom = bottom + segment_size - overlap if bottom + segment_size - overlap <= height else height


def clipping(img, corners, show=False):
    """
    :param img: original image
    :param corners: ((column_min, row_min),(column_max, row_max))
    :return: list of clipping images
    """

    clips = []
    for corner in corners:
        ((column_min, row_min), (column_max, row_max)) = corner
        clip = img[row_min:row_max, column_min:column_max]
        clips.append(clip)
        if show:
            cv2.imshow('clip', clip)
            cv2.waitKey(0)
    return clips

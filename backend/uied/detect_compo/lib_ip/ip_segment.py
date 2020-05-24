import cv2
import numpy as np
import shutil
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


def clipping(img, components, pad=0, show=False):
    """
    :param adjust: shrink(negative) or expand(positive) the bounding box
    :param img: original image
    :param corners: ((column_min, row_min),(column_max, row_max))
    :return: list of clipping images
    """
    clips = []
    for component in components:
        clip = component.compo_clipping(img, pad=pad)
        clips.append(clip)
        if show:
            cv2.imshow('clipping', clip)
            cv2.waitKey()
    return clips


def dissemble_clip_img(clip_root, org, compos):
    if os.path.exists(clip_root):
        shutil.rmtree(clip_root)
    os.mkdir(clip_root)
    cls_dirs = []

    bkg = org.copy()
    for compo in compos:
        cls = compo.category
        c_root = pjoin(clip_root, cls)
        c_path = pjoin(c_root, str(compo.id) + '.jpg')
        if cls not in cls_dirs:
            os.mkdir(c_root)
            cls_dirs.append(cls)
        clip = compo.compo_clipping(org)
        cv2.imwrite(c_path, clip)

        col_min, row_min, col_max, row_max = compo.put_bbox()
        cv2.rectangle(bkg, (col_min, row_min), (col_max, row_max), (255, 255, 255), -1)
    cv2.imwrite(os.path.join(clip_root, 'bkg.jpg'), bkg)

import cv2
import numpy as np
import json
from random import randint as rint
import os
import shutil

color_map = {'Text':(255,6,6), 'Compo':(6,255,6)}


def dissemble_clip_img(clip_root, org, compos):
    shutil.rmtree(clip_root)
    os.mkdir(clip_root)
    cls_dirs = []

    compos = compos['compos']
    bkg = org.copy()
    for compo in compos:
        cls = compo['class']
        c_root = os.path.join(clip_root, cls)
        c_path = os.path.join(c_root, str(compo['id']) + '.jpg')
        if cls not in cls_dirs:
            c_root = os.path.join(clip_root, cls)
            os.mkdir(c_root)
            cls_dirs.append(cls)

        col_min, row_min, col_max, row_max = compo['column_min'], compo['row_min'], compo['column_max'], compo['row_max']
        cv2.rectangle(bkg, (col_min, row_min), (col_max, row_max), (255,255,255), -1)
        clip = org[row_min:row_max, col_min: col_max]

        cv2.imwrite(c_path, clip)
    cv2.imwrite(os.path.join(clip_root, 'bkg.jpg'), bkg)


def resize_by_height(org, resize_height):
    w_h_ratio = org.shape[1] / org.shape[0]
    resize_w = resize_height * w_h_ratio
    re = cv2.resize(org, (int(resize_w), int(resize_height)))
    return re


def draw_bounding_box_class(org, corners, compo_class, line=2, show=False, name='img', output=None):
    board = org.copy()
    for i in range(len(corners)):
        board = cv2.rectangle(board, (corners[i][0], corners[i][1]), (corners[i][2], corners[i][3]), color_map[compo_class[i]], line)
        # board = cv2.putText(board, compo_class[i], (corners[i][0]+5, corners[i][1]+20),
        #                     cv2.FONT_HERSHEY_SIMPLEX, 0.5, color_map[compo_class[i]], 2)
    if show:
        cv2.imshow(name, board)
        cv2.waitKey(0)

    if output is not None:
        cv2.imwrite(output, board)
    return board


def draw_region(region, board, color=None, show=False):
    if color is None:
        color = (rint(0,255), rint(0,255), rint(0,255))
    for point in region:
        board[point[0], point[1]] = color
    if show:
        cv2.imshow('region', board)
        cv2.waitKey()
    return board


def draw_bounding_box(org, slices, color=(0, 255, 0), line=2, name='board', show=False, write_path=None):
    '''
    :param slices: [[col_min, row_min, col_max, row_max]]
    '''
    board = org.copy()
    for box in slices:
        board = cv2.rectangle(board, (box[0], box[1]), (box[2], box[3]), color, line)
    if show:
        cv2.imshow(name, resize_by_height(board, resize_height=800))
        cv2.waitKey(0)
    if write_path is not None:
        cv2.imwrite(write_path, board)
    return board


def cvt_json(corners, category):
    '''
    :param corners: [[col_min, row_min, col_max, row_max]]
    '''
    components = {'compos':[]}
    for i in range(len(corners)):
        corner = corners[i]
        c = {'class': category[i], 'id': i,
             'column_min': corner[0], 'row_min': corner[1], 'column_max': corner[2], 'row_max': corner[3],
             'width': corner[2] - corner[0], 'height': corner[3] - corner[1]}
        components['compos'].append(c)
    return components


def save_corners_json(file_path, components):
    f_out = open(file_path, 'w')
    json.dump(components, f_out, indent=4)

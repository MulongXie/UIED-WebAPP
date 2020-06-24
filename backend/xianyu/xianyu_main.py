import cv2
import numpy as np
from random import randint as rint
import time
import json
from os.path import join as pjoin
import multiprocessing
import os

import xianyu_ocr as ocr
import xianyu_merge as merge
import xianyu_utils as utils


def gradient_laplacian(org):
    lap = cv2.Laplacian(org, cv2.CV_16S, 3)
    lap = cv2.convertScaleAbs(lap)
    return lap


def rm_noise_flood_fill(img, grad_thresh=10, show=False):
    grad_thresh = (grad_thresh, grad_thresh, grad_thresh)
    mk = np.zeros((img.shape[0]+2, img.shape[1]+2), dtype=np.uint8)
    for x in range(0, img.shape[0], 10):
        for y in range(0, img.shape[1], 10):
            if mk[x, y] == 0:
                cv2.floodFill(img, mk, (y, x), (0,0,0), grad_thresh, grad_thresh, cv2.FLOODFILL_FIXED_RANGE)
    if show:
        cv2.imshow('floodfill', img)
        cv2.waitKey()


def slicing(img, leaves, base_upleft, show=False):
    '''
    slices: [[col_min, row_min, col_max, row_max]]
    '''
    row, col = img.shape[:2]
    slices = []
    up, bottom, left, right = -1, -1, -1, -1
    obj = False
    for x in range(row):
        if np.sum(img[x]) != 0:
            if not obj:
                up = x
                obj = True
                continue
        else:
            if obj:
                bottom = x
                obj = False
                box = [0, up, col, bottom]
                if bottom - up > 10 and (bottom - up) * col > 200:
                    slices.append(box)
                continue

    obj = False
    for y in range(col):
        if np.sum(img[:, y]) != 0:
            if not obj:
                left = y
                obj = True
                continue
        else:
            if obj:
                right = y
                obj = False
                box = [left, 0, right, row]
                if right - left > 10 and (right - left) * row > 200:
                    slices.append(box)
                continue

    for box in slices:
        slice_img = img[box[1]:box[3], box[0]:box[2]]
        box = [box[0] + base_upleft[0], box[1] + base_upleft[1], box[2] + base_upleft[0], box[3] + base_upleft[1]]
        children = slicing(slice_img, leaves, (box[0], box[1]), show=show)
        if len(children) == 0:
            leaves.append(box)
            if show:
                cv2.imshow('slices', slice_img)
                cv2.waitKey()
    return slices


def detect_compo(org, output_path=None, show=False):
    start = time.clock()
    grad = gradient_laplacian(org)
    rm_noise_flood_fill(grad, show=False)
    compo_bbox = []
    slicing(grad, compo_bbox, (0, 0), show=False)
    utils.draw_bounding_box(org, compo_bbox, show=show)
    if output_path is not None:
        utils.save_corners_json(output_path + '.json', compo_bbox, np.full(len(compo_bbox), 'Compo'))
    # print('Compo det [%.3fs]' % (time.clock() - start))
    return compo_bbox


def xianyu(input_path_img,
           output_root,
           show=False):

    output_path_json = output_root + '/compo.json'
    output_path_img = output_root + '/result.jpg'
    clip_root = output_root + '/clips'

    if not os.path.exists(output_root):
        os.mkdir(output_root)
    if not os.path.exists(clip_root):
        os.mkdir(clip_root)

    start = time.clock()
    org = cv2.imread(input_path_img)
    img = utils.resize_by_height(org, resize_height=800)

    compo = detect_compo(img, show=show)
    text = ocr.ocr(org, show=show)
    compo_merge, categories = merge.incorporate(img, compo, text, show=show)
    compos = utils.cvt_json(compo_merge, categories, img.shape)

    utils.dissemble_clip_img(clip_root, img, compos)
    utils.draw_bounding_box_class(img, compo_merge, categories, output=output_path_img)
    utils.save_corners_json(output_path_json, compos)
    print('[%.3fs] %s' % (time.clock() - start, input_path_img))

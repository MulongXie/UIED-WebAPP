import os
import sys
import cv2
import json
import base64
# *** set project root directory ***
root = '/'.join(__file__.split('/')[:-1])
sys.path.append(root)
# **********************************


def compound_img(compos):
    compos = compos['compos']
    bkg = cv2.imread(compos[0]['clip'][3:])
    height, width = bkg.shape[:2]

    for i in range(1, len(compos)):
        compo = compos[i]
        clip = cv2.resize(cv2.imread(compo['clip'][3:]), (int(compo['width']), int(compo['height'])))
        row_min = int(compo['row_min'])
        row_max = row_min + int(compo['height'])
        col_min = int(compo['column_min'])
        col_max = col_min + int(compo['width'])

        if row_min > height - 1 or row_max < 0 or col_min > width - 1 or col_max < 0:
            print('*** Exceed Margin ***')
            continue

        clip_top, clip_bottom = 0, int(compo['height'])
        clip_left, clip_right = 0, int(compo['width'])

        if row_min < 0:
            clip_top = 0 - row_min
            row_min = 0
        if row_max > height - 1:
            clip_bottom = height - 1 - row_min
            row_max = height - 1

        if col_min < 0:
            clip_left = 0 - col_min
            col_min = 0
        if col_max > width - 1:
            clip_right = width - 1 - col_min
            col_max = width - 1

        # print(row_min, col_min, row_max, col_max)
        # print(clip_top, clip_bottom, clip_left, clip_right, '\n')

        bkg[row_min: row_max, col_min: col_max] = clip[clip_top: clip_bottom, clip_left: clip_right]
        # print(bkg_cp.shape)
        # print(compo['row_min'], int(compo['row_min']) + int(compo['height']), compo['column_min'], int(compo['column_min']) + int(compo['width']))
    cv2.imshow('compo', bkg)
    cv2.waitKey()
    return bkg


input_path, compos_path = sys.argv[1:3]

compos = json.load(open(compos_path, 'r'))
compound = compound_img(compos)

print(base64.b64encode(cv2.imencode('.jpg', compound)[1]).decode())
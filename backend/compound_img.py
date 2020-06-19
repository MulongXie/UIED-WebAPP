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

    for i in range(1, len(compos)):
        compo = compos[i]
        clip = cv2.resize(cv2.imread(compo['clip'][3:]), (int(compo['width']), int(compo['height'])))
        bkg[int(compo['row_min']): int(compo['row_min']) + int(compo['height']),
               int(compo['column_min']): int(compo['column_min']) + int(compo['width'])] = clip
        # print(bkg_cp.shape)
        # print(compo['row_min'], int(compo['row_min']) + int(compo['height']), compo['column_min'], int(compo['column_min']) + int(compo['width']))
    cv2.imshow('compo', bkg)
    cv2.waitKey()
    return bkg


input_path, compos_path = sys.argv[1:3]

compos = json.load(open(compos_path, 'r'))
compound = compound_img(compos)

print(base64.b64encode(cv2.imencode('.jpg', compound)[1]).decode())
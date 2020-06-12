import os
import sys
# *** set project root directory ***
root = '/'.join(__file__.split('/')[:-1])
sys.path.append(os.path.join(root, 'yolo'))
sys.path.append(os.path.join(root, 'yolo/config'))
# **********************************
import time
import cv2

import yolo_main as yolo

input_path, output_root = sys.argv[1:3]
yolo.yolo(input_path, output_root)

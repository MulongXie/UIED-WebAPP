import os
import sys
# *** set project root directory ***
root = '/'.join(__file__.split('/')[:-1])
sys.path.append(os.path.join(root, 'uied'))
sys.path.append(os.path.join(root, 'uied/detect_compo'))
sys.path.append(os.path.join(root, 'uied/detect_text_east'))
sys.path.append(os.path.join(root, 'uied/cnn'))
sys.path.append(os.path.join(root, 'uied/config'))
# **********************************
import time
import cv2

import uied_main as uied

input_path, output_root = 'uied/data/input/11300.jpg', 'uied/data/output'
# input_path, output_root = sys.argv[1:3]
if not os.path.exists(output_root):
    os.mkdir(output_root)

uied.uied(input_path, output_root)

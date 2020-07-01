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

# input_path, output_root, params = 'uied/data/input/9.jpg', 'uied/data/output', None
input_path, output_root, params = sys.argv[1:4]
if not os.path.exists(output_root):
    os.mkdir(output_root)

uied.uied(input_path, output_root, params)

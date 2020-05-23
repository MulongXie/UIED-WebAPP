import os
import sys
# *** set project root directory ***
root = '/'.join(__file__.split('/')[:-1])
sys.path.append(os.path.join(root, 'backend/uied'))
sys.path.append(os.path.join(root, 'backend/uied/detect_compo'))
sys.path.append(os.path.join(root, 'backend/uied/detect_text_east'))
sys.path.append(os.path.join(root, 'backend/uied/cnn'))
sys.path.append(os.path.join(root, 'backend/uied/config'))
# **********************************
import time
import cv2

import uied_main as uied

start = time.clock()

input_path, output_path = sys.argv[1:3]

uied.uied(input_path, output_path)

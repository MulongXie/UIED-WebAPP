import os
import sys
# *** set project root directory ***
root = '/'.join(__file__.split('/')[:-1])
sys.path.append(os.path.join(root, 'xianyu'))
# **********************************

import xianyu_main as xy

img_name = sys.argv[1]
# img_name = 0
input_path = 'data/inputs/' + str(img_name) + '.png'
output_path = 'data/outputs/result' + str(img_name) + '.png'

xy.xianyu(input_path, output_path, show=False)

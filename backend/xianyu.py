import os
import sys
# *** set project root directory ***
root = '/'.join(__file__.split('/')[:-1])
sys.path.append(root)
sys.path.append(os.path.join(root, 'xianyu'))
# **********************************

import xianyu_main as xy

# input_path = 'xianyu/data/input/11.jpg'
# output_root = 'xianyu/data/output'
input_path, output_root = sys.argv[1:3]
os.makedirs(output_root, exist_ok=True)

xy.xianyu(input_path, output_root)

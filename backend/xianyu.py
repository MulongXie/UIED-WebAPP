import os
import sys
# *** set project root directory ***
root = '/'.join(__file__.split('/')[:-1])
sys.path.append(root)
sys.path.append(os.path.join(root, 'backend/xianyu'))
# **********************************

import xianyu_main as xy

# input_path = 'data/example/1.jpg'
# output_path = 'data/outputs/1.jpg'
input_path, output_root = sys.argv[1:3]
print("Processing:", input_path, 'to', output_root)

xy.xianyu(input_path, output_root, show=False)
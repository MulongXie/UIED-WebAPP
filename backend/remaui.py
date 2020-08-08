import os
import sys
# *** set project root directory ***
root = '/'.join(__file__.split('/')[:-1])
sys.path.append(os.path.join(root, 'remaui'))
sys.path.append(os.path.join(root, 'remaui/data'))
# **********************************
import remaui_main as remaui

# input_path = 'remaui\\data\\input\\14.jpg'
# output_root = 'remaui\\data\\output'
input_path, output_root = sys.argv[1:3]
os.makedirs(output_root, exist_ok=True)

remaui.remaui(input_path, output_root)

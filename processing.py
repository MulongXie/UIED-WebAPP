import os
import sys
# *** set project root directory ***
root = '/'.join(__file__.split('/')[:-1])
sys.path.append(os.path.join(root, 'processing'))
sys.path.append(os.path.join(root, 'processing/uied'))
sys.path.append(os.path.join(root, 'processing/ctpn'))
sys.path.append(os.path.join(root, 'processing/ctpn/ctpn'))
sys.path.append(os.path.join(root, 'processing/config'))
# **********************************
import time
import cv2

import lib_uied.ip_preprocessing as pre

start = time.clock()
index = sys.argv[1]

input_path = 'data/inputs/' + str(index) + '.png'
output_path = 'data/outputs/result' + str(index) + '.png'

print("*** Processing starts ***")
img = cv2.imread(input_path, 0)
binary = pre.preprocess(img)

cv2.imwrite(output_path, binary)
print("*** Processing complete, time taken: %.3fs ***" % (time.clock() - start))
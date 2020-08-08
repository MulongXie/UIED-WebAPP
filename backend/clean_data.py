import os
from os.path import join as pjoin
from glob import glob
import shutil


root = '/'.join(__file__.split('/')[:-2])
outputs = [f for f in glob(pjoin(root, 'data', 'outputs', '*')) if '.' not in f]

for output in outputs:
    print(output)
    shutil.rmtree(output)
    os.mkdir(output)

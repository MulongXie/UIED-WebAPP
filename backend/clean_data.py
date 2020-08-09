import os
from os.path import join as pjoin
from glob import glob
import shutil


root = '/'.join(__file__.split('/')[:-2])
output_root = pjoin(root, 'data', 'outputs')
outputs = [f for f in glob(pjoin(output_root, '*')) if '.' not in f]
for output in outputs:
    print(output)
    shutil.rmtree(output)
    os.mkdir(output)

open(pjoin(output_root, 'success.txt'), 'w').write('')
open(pjoin(output_root, 'failed.txt'), 'w').write('')
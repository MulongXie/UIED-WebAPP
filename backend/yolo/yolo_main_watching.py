from __future__ import division

from models import *
from utils.utils import *
from utils.datasets import *
import utils.ip_utils as ip

import os
import sys
import time
import datetime
import argparse
import cv2
import json
from random import randint as rint
from os.path import join as pjoin
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from PIL import Image

import torch
from torch.utils.data import DataLoader
from torchvision import datasets
from torch.autograd import Variable

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.ticker import NullLocator


class Option:
    def __init__(self):
        # cwd = pjoin(os.getcwd(), 'backend/yolo')   # For really run
        cwd = os.getcwd()   # For isolated testing
        self.weights_path = pjoin(cwd, "E:\Mulong\Model\YOLO_cjs_rico\yolov3_ckpt_10.pth")
        # self.weights_path = pjoin(cwd, "model/yolov3_ckpt_10.pth")
        self.model_def = pjoin(cwd, "config/yolov3-rico.cfg")
        self.class_path = pjoin(cwd, "config/rico_classes.names")
        self.conf_thres = 0.8
        self.nms_thres = 0.4
        self.batch_size = 1
        self.n_cpu = 0
        self.img_size = 608


class Params:
    def __init__(self, opt=None, model=None, input_img_path=None, output_root=None,
                 note_success_file=None, note_fail_file = None):
        self.opt = opt
        self.model = model
        self.input_img_path = input_img_path
        self.output_root = output_root
        self.note_success_file = note_success_file
        self.note_fail_file = note_fail_file

    def update(self, opt, model, input_img_path, output_root):
        self.opt = opt
        self.model = model
        self.input_img_path = input_img_path
        self.output_root = output_root

    def get_params(self):
        return self.opt, self.model, self.input_img_path, self.output_root, self.note_success_file, self.note_fail_file


class MyHandler(FileSystemEventHandler):
    # def on_created(self, event):
    #     print('event type ', event.event_type, "path ", event.src_path)
    #     params.input_img_path = event.src_path
    #     try:
    #         time.sleep(0.5)
    #         detect()
    #     except:
    #         print("Processing Failed")

    def on_modified(self, event):
        # print('event type ', event.event_type, "path ", event.src_path)
        paths = open(event.src_path).readlines()[-1].split()
        # print(new_paths)

        params.input_img_path = paths[0]
        params.output_root = paths[1]
        params.note_success_file = paths[2]
        params.note_fail_file = paths[3]
        try:
            time.sleep(0.5)
            detect()
        except Exception as e:
            open(params.note_fail_file, 'a').write(params.input_img_path + '\n')
            print("Process Failed for:", params.input_img_path)
            print("Exception:", e, '\n')


def detect():
    opt, model, input_img_path, output_root, note_success_file, note_fail_file = params.get_params()
    os.makedirs(output_root, exist_ok=True)

    print("YOLO processing img:", input_img_path, " Output Dir:", output_root)
    img_refresh = cv2.imread(input_img_path)
    cv2.imwrite(input_img_path, img_refresh)
    dataloader = DataLoader(
        # ImageFolder(opt.image_folder, img_size=opt.img_size),
        ImageFolder([input_img_path], img_size=opt.img_size),
        batch_size=opt.batch_size,
        shuffle=False,
        num_workers=opt.n_cpu,
    )

    classes = load_classes(opt.class_path)  # Extracts class labels from file

    Tensor = torch.cuda.FloatTensor if torch.cuda.is_available() else torch.FloatTensor

    imgs = []  # Stores image paths
    img_detections = []  # Stores detections for each image index

    # print("\nPerforming object detection:")
    prev_time = time.time()
    for batch_i, (img_paths, input_imgs) in enumerate(dataloader):
        # Configure input
        input_imgs = Variable(input_imgs.type(Tensor))

        # Get detections
        with torch.no_grad():
            detections = model(input_imgs)
            detections = non_max_suppression(detections, opt.conf_thres, opt.nms_thres)

        # Log progress
        current_time = time.time()
        inference_time = datetime.timedelta(seconds=current_time - prev_time)
        prev_time = current_time
        # print("\t+ Batch %d, Inference Time: %s" % (batch_i, inference_time))

        # Save image and detections
        imgs.extend(img_paths)
        img_detections.extend(detections)

    # Bounding-box colors
    cmap = plt.get_cmap("tab20b")
    colors = [cmap(i) for i in np.linspace(0, 1, 20)]

    # print("\nSaving images:")
    # set unique color for different categories
    bbox_colors = {}
    for img_i, (path, detections) in enumerate(zip(imgs, img_detections)):
        org = cv2.imread(path)
        img = org.copy()
        img_shape = img.shape

        # Rescale boxes to original image
        # print(opt.img_size, img.shape)
        detections = rescale_boxes(detections, opt.img_size, img.shape[:2])

        compos = {'compos': []}
        compos['compos'].append(
            {'id': 0, 'class': 'Background', 'column_min': 0, 'row_min': 0, 'column_max': img_shape[1],
             'row_max': img_shape[0], 'width': img_shape[1], 'height': img_shape[0]})
        # Draw bounding boxes and labels of detections
        for i, (x1, y1, x2, y2, conf, cls_conf, cls_pred) in enumerate(detections):

            # print("\t+ Label: %s, Conf: %.5f" % (classes[int(cls_pred)], cls_conf.item()))
            # set color for different class
            if classes[int(cls_pred)] not in bbox_colors:
                bbox_colors[classes[int(cls_pred)]] = (rint(0, 255), rint(0, 255), rint(0, 255))
            color = bbox_colors[classes[int(cls_pred)]]
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

            # save detection result as json
            c = {'id': i + 1, 'class': classes[int(cls_pred)],
                 'column_min': int(x1), 'row_min': int(y1), 'column_max': int(x2), 'row_max': int(y2),
                 'width': int(x2 - x1), 'height': int(y2 - y1)}
            compos['compos'].append(c)

        cv2.imshow('detection', cv2.resize(img, (int(img.shape[1] / 2), int(img.shape[0] / 2))))
        cv2.waitKey(10)
        cv2.destroyAllWindows()

        # Save generated image with detections
        # ip.dissemble_clip_img_hollow(pjoin(output_root, 'clips'), org, compos['compos'])
        ip.dissemble_clip_img_fill(pjoin(output_root, 'clips'), org, compos['compos'])
        cv2.imwrite(pjoin(output_root, 'result.jpg'), img)
        json.dump(compos, open(pjoin(output_root, "compo.json"), 'w'), indent=4)
        print('Processing Done and Write to:', output_root, '\n')
        open(note_success_file, 'a').write(output_root + '\n')


def yolo(input_img_path=None, output_root=None):
    opt = Option()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Set up model
    print("YOLO load model from:", opt.weights_path)
    model = Darknet(opt.model_def, img_size=opt.img_size).to(device)
    model.load_state_dict(torch.load(opt.weights_path))  # load trained model
    model.eval()  # Set in evaluation mode

    params.update(opt, model, input_img_path, output_root)

    # Actively watch input files
    path = os.path.join(os.getcwd(), 'parameters/')
    observer = Observer()
    event = MyHandler()
    observer.schedule(event, path, recursive=False)
    observer.start()
    print("Watching Input File:", path)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

    # detect()


params = Params()
yolo()
# yolo('data/input/0.jpg', 'data/output')

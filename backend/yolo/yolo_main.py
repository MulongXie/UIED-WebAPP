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
        cwd = pjoin(os.getcwd(), 'backend/yolo')   # For really run
        # cwd = os.getcwd()   # For isolated testing
        self.weights_path = pjoin(cwd, "E:\Mulong\Model\YOLO_cjs_rico\yolov3_ckpt_10.pth")
        # self.weights_path = pjoin(cwd, "model/yolov3_ckpt_10.pth")
        self.model_def = pjoin(cwd, "config/yolov3-rico.cfg")
        self.class_path = pjoin(cwd, "config/rico_classes.names")
        self.conf_thres = 0.8
        self.nms_thres = 0.4
        self.batch_size = 1
        self.n_cpu = 0
        self.img_size = 608


def yolo(input_img_path, output_root):
    # parser = argparse.ArgumentParser()
    # parser.add_argument("--image_folder", type=str, default="data/input", help="path to dataset")
    # parser.add_argument("--model_def", type=str, default="config/yolov3-rico.cfg", help="path to model definition file")
    # parser.add_argument("--weights_path", type=str, default="result/run/rico/yolov3_ckpt_10.pth",
    #                     help="path to weights file")
    # parser.add_argument("--class_path", type=str, default="data/rico/classes.names", help="path to class label file")
    # parser.add_argument("--conf_thres", type=float, default=0.8, help="object confidence threshold")
    # parser.add_argument("--nms_thres", type=float, default=0.4, help="iou thresshold for non-maximum suppression")
    # parser.add_argument("--batch_size", type=int, default=1, help="size of the batches")
    # parser.add_argument("--n_cpu", type=int, default=0, help="number of cpu threads to use during batch generation")
    # parser.add_argument("--img_size", type=int, default=608, help="size of each image dimension")
    # parser.add_argument("--checkpoint_model", type=str, help="path to checkpoint model")
    # opt = parser.parse_args()
    opt = Option()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    os.makedirs(output_root, exist_ok=True)
    # os.makedirs("output", exist_ok=True)

    img_refresh = cv2.imread(input_img_path)
    cv2.imwrite(input_img_path, img_refresh)

    # Set up model
    print("YOLO load model from:", opt.weights_path)
    model = Darknet(opt.model_def, img_size=opt.img_size).to(device)
    model.load_state_dict(torch.load(opt.weights_path))  # load trained model
    model.eval()  # Set in evaluation mode

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

        print("YOLO processing img:", path)
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

        # cv2.imshow('detection', cv2.resize(img, (int(img.shape[1] / 2), int(img.shape[0] / 2))))
        # cv2.waitKey()

        # Save generated image with detections
        # ip.dissemble_clip_img_hollow(pjoin(output_root, 'clips'), org, compos['compos'])
        ip.dissemble_clip_img_fill(pjoin(output_root, 'clips'), org, compos['compos'])
        cv2.imwrite(pjoin(output_root, 'result.jpg'), img)
        json.dump(compos, open(pjoin(output_root, "compo.json"), 'w'), indent=4)
        print('Write to:', output_root)


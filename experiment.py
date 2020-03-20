import cv2
import numpy as np


def nothing(x):
    pass


def get_contour(org, binary):
    board = org.copy()
    hie, contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    res_contour = []
    for i in range(len(contours)):
        if cv2.contourArea(contours[i]) < 200:
            continue
        cnt = cv2.approxPolyDP(contours[i], 0.001*cv2.arcLength(contours[i], True), True)
        res_contour.append(cnt)
    cv2.drawContours(board, res_contour, -1, (0,0,255), 1)
    return board


img_file = 'E:\\Mulong\\Datasets\\rico\\combined\\1014.jpg'
resize_height = 800

cv2.namedWindow('control')
cv2.createTrackbar('resize_height', 'control', 800, 1600, nothing)
cv2.createTrackbar('grad_min', 'control', 4, 255, nothing)
cv2.createTrackbar('grad_min_blk', 'control', 5, 255, nothing)
cv2.createTrackbar('c1', 'control', 1, 1000, nothing)
cv2.createTrackbar('c2', 'control', 1, 1000, nothing)


while 1:
    resize_height = cv2.getTrackbarPos('resize_height', 'control')
    grad_min = cv2.getTrackbarPos('grad_min', 'control')
    grad_min_blk = cv2.getTrackbarPos('grad_min_blk', 'control')
    c1 = cv2.getTrackbarPos('c1', 'control')
    c2 = cv2.getTrackbarPos('c2', 'control')

    org = cv2.imread(img_file)
    org = cv2.resize(org, (int(resize_height * (org.shape[1] / org.shape[0])), int(resize_height)))
    # org = cv2.medianBlur(org, 3)
    # org = cv2.GaussianBlur(org, (3,3), 0)
    grey = cv2.cvtColor(org, cv2.COLOR_BGR2GRAY)

    canny = cv2.Canny(grey, c1, c2)
    contour = get_contour(org, canny)

    cv2.imshow('org', org)
    cv2.imshow('canny', canny)
    cv2.imshow('contour', contour)

    cv2.waitKey(10)

import cv2

img = cv2.imread('data/input/0.jpg')

print(img.shape)
cv2.imshow('f', img)
cv2.waitKey()
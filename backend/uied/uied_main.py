from os.path import join as pjoin
import os
import detect_compo.ip_region_proposal as ip
import cv2


def resize_height_by_longest_edge(img_path, resize_length=800):
    org = cv2.imread(img_path)
    height, width = org.shape[:2]
    if height > width:
        return resize_length
    else:
        return int(resize_length * (height / width))


def uied(input_path, output_root, params=None,
         is_ip=True, is_clf=True, is_ocr=False, is_merge=False):

    resized_height = resize_height_by_longest_edge(input_path)

    if is_ocr:
        os.makedirs(pjoin(output_root, 'ocr'), exist_ok=True)
        import ocr_east as ocr
        import lib_east.eval as eval
        models = eval.load()
        ocr.east(input_path, output_root, models,
                 resize_by_height=resized_height, show=False)

    if is_ip:
        os.makedirs(pjoin(output_root, 'ip'), exist_ok=True)
        # switch of the classification func
        classifier = None
        if is_clf:
            classifier = {}
            from CNN import CNN
            # classifier['Image'] = CNN('Image')
            classifier['Elements'] = CNN('Elements')
            # classifier['Noise'] = CNN('Noise')
        ip.compo_detection(input_path, output_root,
                           uied_params=params, classifier=classifier,
                           resize_by_height=resized_height, show=False)

    if is_merge:
        # os.makedirs(pjoin(output_root, 'merge'), exist_ok=True)
        import merge
        name = input_path.split('/')[-1][:-4]
        compo_path = pjoin(output_root, 'ip', str(name) + '.json')
        ocr_path = pjoin(output_root, 'ocr', str(name) + '.json')
        merge.incorporate(input_path, compo_path, ocr_path, output_root,
                          resize_by_height=resized_height, show=False)


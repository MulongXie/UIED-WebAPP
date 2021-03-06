import os
import sys
# *** set project root directory ***
root = '/'.join(__file__.split('/')[:-1])
sys.path.append(os.path.join(root, 'detect_compo'))
sys.path.append(os.path.join(root, 'detect_text_east'))
sys.path.append(os.path.join(root, 'cnn'))
sys.path.append(os.path.join(root, 'config'))
sys.path.append(os.path.join(root, 'utils'))

from os.path import join as pjoin
import time
import cv2
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

import detect_compo.ip_region_proposal as ip
from utils.watcher import Params


def load_models(text, compo):
    models = {'text':None, 'compo':None}

    # Text: EAST OCR model
    if text:
        import lib_east.eval as eval
        models['text'] = eval.load()

    # Component: CNN for compo class
    if compo:
        model_compo = {}
        from CNN import CNN
        # model_compo['Image'] = CNN('Image')
        model_compo['Elements'] = CNN('Elements')
        # model_compo['Noise'] = CNN('Noise')
        models['compo'] = model_compo
    return models


def resize_height_by_longest_edge(img_path, resize_length=800):
    org = cv2.imread(img_path)
    height, width = org.shape[:2]
    if height > width:
        return resize_length
    else:
        return int(resize_length * (height / width))


def uied():
    start = time.clock()
    models, input_path, output_root, note_success_file, note_fail_file, uied_params = params.get_params()
    print("UIED Running on:", input_path, " Write to:", output_root)

    resized_height = resize_height_by_longest_edge(input_path)

    if is_ocr:
        import ocr_east as ocr
        os.makedirs(pjoin(output_root, 'ocr'), exist_ok=True)
        ocr.east(input_path, output_root, models['text'],
                 resize_by_height=resized_height, show=False)

    if is_ip:
        os.makedirs(pjoin(output_root, 'ip'), exist_ok=True)
        ip.compo_detection(input_path, output_root,
                           uied_params=uied_params, classifier=models['compo'],
                           resize_by_height=resized_height, show=False)

    if is_merge:
        # os.makedirs(pjoin(output_root, 'merge'), exist_ok=True)
        import merge
        name = input_path.split('/')[-1][:-4]
        compo_path = pjoin(output_root, 'ip', str(name) + '.json')
        ocr_path = pjoin(output_root, 'ocr', str(name) + '.json')
        merge.incorporate(input_path, compo_path, ocr_path, output_root,
                          resize_by_height=resized_height, show=False)

    open(note_success_file, 'a').write(output_root + '\n')
    print("[UIED complete in %.3fs]" % (time.clock() - start))
    print(time.ctime(), '\n')


class MyHandler(FileSystemEventHandler):
    # run uied if parameters file changes
    def on_modified(self, event):
        # print('event type', event.event_type, "path", event.src_path)
        params.load_params(event.src_path)
        try:
            # time.sleep(0.5)
            uied()
        except Exception as e:
            open(params.note_fail_file, 'a').write(params.input_img_path + '\n')
            print("Process Failed for:", params.input_img_path)
            print("Exception:", e, '\n')


def main_watching(input_img_path=None, output_root=None):
    models = load_models(is_ocr, is_cls)
    params.update_params(models, input_img_path, output_root)

    # watching parameter file
    param_file = pjoin(os.getcwd(), 'parameters/')
    # action while the file changes
    event = MyHandler()
    observer = Observer()
    observer.schedule(event, param_file)
    observer.start()
    print("Watching Input File:", param_file)
    try:
        # keep watching
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        # terminate by keyboard interrupt
        observer.stop()
    observer.join()


is_ip = True
is_cls = False
is_ocr = True
is_merge = True

params = Params()
main_watching('data/5.jpg', 'data')

from os.path import join as pjoin
import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

import detect_compo.ip_region_proposal as ip
from utils.watcher import *


def load_models(text, compo):
    model_text, model_compo = None, None

    # Text: EAST OCR model
    if text:
        import lib_east.eval as eval
        model_text = eval.load()

    # Component: CNN for compo class
    if compo:
        model_compo= {}
        from CNN import CNN
        model_compo['Image'] = CNN('Image')
        model_compo['Elements'] = CNN('Elements')
        model_compo['Noise'] = CNN('Noise')
    return model_text, model_compo


def uied(is_ip=True, is_ocr=True, is_merge=True):
    models, input_path, output_root, note_success_file, note_fail_file, uied_params = params.get_params()
    print("UIED Running on:", input_path, " Write to:", output_root)
    model_text, model_compo = models
    if is_ocr:
        import ocr_east as ocr
        os.makedirs(pjoin(output_root, 'ocr'), exist_ok=True)
        ocr.east(input_path, output_root, model_text, resize_by_height=None, show=False, write_img=True)

    if is_ip:
        os.makedirs(pjoin(output_root, 'ip'), exist_ok=True)
        # switch of the classification func
        ip.compo_detection(input_path, output_root, uied_params, classifier=model_compo, resize_by_height=800, show=False)

    if is_merge:
        import merge
        # os.makedirs(pjoin(output_root, 'merge'), exist_ok=True)
        name = input_path.split('/')[-1][:-4]
        compo_path = pjoin(output_root, 'ip', str(name) + '.json')
        ocr_path = pjoin(output_root, 'ocr', str(name) + '.json')
        merge.incorporate(input_path, compo_path, ocr_path, output_root, resize_by_height=800, show=False)

    open(note_success_file, 'a').write(output_root + '\n')


class MyHandler(FileSystemEventHandler):
    def on_modified(self, event):
        # print('event type', event.event_type, "path", event.src_path)
        params.load_params(event.src_path)
        try:
            time.sleep(0.5)
            uied()
        except Exception as e:
            open(params.note_fail_file, 'a').write(params.input_img_path + '\n')
            print("Process Failed for:", params.input_img_path)
            print("Exception:", e, '\n')


def main_watching(input_img_path=None, output_root=None):
    models = load_models(True, False)
    params.update_params(models, input_img_path, output_root)

    event = MyHandler()
    param_file = pjoin(os.getcwd(), 'parameters/')
    observer = Observer()
    observer.schedule(event, param_file)
    observer.start()
    print("Watching Input File:", param_file)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


params = Params()
main_watching('data/5.jpg', 'data')

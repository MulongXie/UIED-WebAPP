from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class Params:
    def __init__(self, models=None, input_img_path=None, output_root=None,
                 note_success_file=None, note_fail_file=None):
        # models for text detection (EAST) and component detection (CNNs)
        self.models = models
        # input, output and log path
        self.input_img_path = input_img_path
        self.output_root = output_root
        self.note_success_file = note_success_file
        self.note_fail_file = note_fail_file

    def load_params(self, param_file):
        params = open(param_file).readlines()[-1].split()
        self.input_img_path = params[0]
        self.output_root = params[1]
        self.note_success_file = params[2]
        self.note_fail_file = params[3]

    def update_params(self, models, input_img_path, output_root):
        self.models = models
        self.input_img_path = input_img_path
        self.output_root = output_root

    def get_params(self):
        return self.models, self.input_img_path, self.output_root, self.note_success_file, self.note_fail_file


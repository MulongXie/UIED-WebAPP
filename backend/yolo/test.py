from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time
import os


class MyHandler(FileSystemEventHandler):
    def on_created(self, event):
        print('event type ', event.event_type, "path ", event.src_path)

    def on_modified(self, event):
        print('Changing')
        # time.sleep(1)
        print('event type ', event.event_type, "path ", event.src_path)
        f = open(event.src_path, 'r')
        print(f.readlines()[-1])


path = os.path.join(os.getcwd(), 'data/input')
observer = Observer()
event = MyHandler()
observer.schedule(event, path, recursive=True)
observer.start()
print("Watching Input File:", path)
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    observer.stop()
observer.join()
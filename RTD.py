import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

#Both methods only detects change when file is saved

#while True:
#	x=True
#	with open('./text.txt') as f:
#		while x is True:
#			line = f.readline()
#			if line:
#				print(line)
#			if line == '':
#				x=False
#				f.close()
#				time.sleep(2)


class MyHandler(FileSystemEventHandler):
    def on_modified(self, event):
        print("Thats illegal")
if __name__ == "__main__":
    event_handler = MyHandler()
    observer = Observer()
    observer.schedule(event_handler, path='./', recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
import webview
import os
import sys
from src.server import Server
import threading

class GUI:
    def __init__(self, folder_temp, stat_fold, json_loc, title, min_size):
        self.on = True
        self.temp_folder = folder_temp
        self.stat_folder = stat_fold
        self.title = title
        self.min_size = min_size
        self.json_loc = json_loc

    def start(self):
        server = Server(self.temp_folder, self.stat_folder, self.json_loc)
        server_thread = threading.Thread(target=server.start)
        server_thread.start()
        webview.create_window(self.title, "http://localhost:5000/", min_size=self.min_size, fullscreen=True)
        webview.start() # debug=True
        server_thread.join()
        sys.exit(0)


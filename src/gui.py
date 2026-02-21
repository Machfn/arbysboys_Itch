import webview
import os
from src.server import Server
import threading

class GUI:
    def __init__(self, home, second, third, title, min_size):
        self.on = True
        self.home = home
        self.second = second
        self.third = third
        self.title = title
        self.min_size = min_size

    def start(self):
        server = Server(self.home, self.second, self.third)
        server_thread = threading.Thread(server.start())
        server_thread.start()
        webview.start_window(self.title, "http://localhost:5000/", min_size=self.min_size)
        webview.start(debug=True)


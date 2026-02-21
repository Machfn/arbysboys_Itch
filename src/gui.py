import webview
import os

class GUI:
    def __init__(self, api, html_file, title, size):
        self.api = api
        self.title = title
        self.size = size
        self.html = os.path.join(os.getcwd(), html_file)

    def start(self):
        webview.create_window(self.title, self.html, js_api=self.api, min_size=self.size)
        webview.start(debug=True)


from flask import Flask, render_template

class Server:
    def __init__(self, first_page, second_page, third_page):
        self.server = Flask(__name__)
        @self.server.route("/")
        def index():
            print(first_page)
            return render_template(first_page)
        
        @self.server.route("/layout")
        def layout():
            return render_template(second_page)
        
        @self.server.route("/editor")
        def editor():
            return render_template(third_page)

    def start(self):
        self.server.run()
    
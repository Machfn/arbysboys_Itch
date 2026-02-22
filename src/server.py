from flask import Flask, render_template, request

class Server:
    def __init__(self, temp_folder, stat_fold):
        self.server = Flask(__name__,static_url_path='/assets', template_folder=temp_folder, static_folder=stat_fold)
        @self.server.route("/")
        def index():
            return render_template("home/index.html")
        
        @self.server.route("/layout")
        def layout():
            return render_template("layout/layout.html")
        
        @self.server.route("/editor")
        def editor():
            return render_template("editor/index.html")
        
        @self.server.route("/send_to_board", methods=['POST'])
        def send_to_backend():
            if request.method == 'POST':
                print("here")


    def start(self):
        self.server.run()
    
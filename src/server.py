from flask import Flask, render_template, request
import json
import os


class Server:
    def __init__(self, temp_folder, stat_fold, json_loc):
        self.json_loc = json_loc
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
                # 
                data = request.get_json()
                setup = data.get("setup")
                steps = data.get("steps")
                # print(setup, steps)
                with open(os.path.join(self.json_loc, 'setup.json'), 'w') as json_file:
                    json.dump(setup, json_file, indent=4)
                
                with open(os.path.join(self.json_loc,'steps.json'), 'w') as json_file:
                    json.dump(steps, json_file,  indent=4)
                return "Success", 200
            else:
                return "not post", 404


    def start(self):
        self.server.run()
    
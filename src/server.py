from flask import Flask, render_template, request
import json
import os
from src.conversion import Json
from src.compile_send import Finish


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
                    # Add the converison functions in here
                destination = os.path.join(self.json_loc, "../" ,"output_files", "output_files.ino")

                j = Json(os.path.join(self.json_loc, "setup.json"), os.path.join(self.json_loc,"steps.json"),destination)

                j.empty_file()
                j.libraries()
                setup_data = j.open_file(os.path.join(self.json_loc, "setup.json"))
                j.setup_parse_global(setup_data)
                j.setup_parse_function(setup_data)
                action_data = j.open_file(os.path.join(self.json_loc, "steps.json"))
                j.action_parse(action_data)
                sd = Finish(os.path.join(self.json_loc, "../output_files"))
                result = sd.find_board()
                print(result)
                if result:
                    return "Success", 200
                else:
                    return "Error", 404
            else:
                return "not post", 404


    def start(self):
        self.server.run()
    
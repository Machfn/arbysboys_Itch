import json 

class Json():
    def __init__(self,json_filename,c_file_txt):
        self.json_filename = json_filename
        self.c_file_txt = c_file_txt

    def open_file(self):
        with open(self.json_filename, "r") as f:
            data = json.load(f)

        return data

    def empty_file(self):
        with open(c_file_txt,"w") as e:
            e.write("")

    def write_file(self,file_contents):
        with open(self.c_file_txt, "a") as c:
            for j in file_contents:
                c.write(j)


    def parse_arr(self,data):
        file_contents = []

        for i in data:
            type = i["type"]

            if (type == "pin_mode"):

            else if ("pin_write"):

            else if ("set_variable"):

            else if ("loop"):

            else:

import json
import os


class Json():
   def __init__(self,json_filename,c_file_txt):
       self.json_filename = json_filename
       self.c_file_txt = c_file_txt

   def open_file(self):
       with open(self.json_filename, "r") as f:
           data = json.load(f)
       return data

   def empty_file(self):
       with open(self.c_file_txt,"w") as e:
           e.write("")
    
   def libraries(self):
        with open(self.c_file_txt, "a") as c:
            c.write("#include <Stepper.h>\n#include <Servo.h>\n#include <LED.h>\n\n")

   def write_file(self,file_contents):
       with open(self.c_file_txt, "a") as c:
           for j in file_contents:
               c.write(str(j))

   def parse_arr(self,data):
       file_contents = []

       for i in data:
           type = i["type"]

           if (type == "pin_mode"):
               file_contents.append(type + " " + i["pin"] + " " + i["mode"] + "\n")
           elif (type == "pin_write"):
               file_contents.append(type + " " + i["pin"] + " " + i["value"] + "\n")
           elif (type == "set_variable"):
               file_contents.append(type + " " + i["name"] + " " + i["value"] + "\n")
           elif (type == "loop"):
               file_contents.append(type + " " + i["times"] + " ")
               file_contents.append(i["children"])
               file_contents.append("\n")
           else:
               file_contents.append(type + " " + i["condition"] + " ")
               file_contents.append(i["then"])
               file_contents.append(" ")
               file_contents.append(i["else"])
               file_contents.append("\n")
              
       return file_contents


destination = os.path.join(os.getcwd(),"../" ,"output_files", "output_files.ino")

j = Json("test.json",destination)
data = j.open_file()
file_contents = j.parse_arr(data)
j.empty_file()
j.libraries()





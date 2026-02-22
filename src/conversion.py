import json
import os

class Json():
   def __init__(self,setup,action,output_files):
       self.output_files = output_files
       self.setup = setup
       self.action = action


   def open_file(self,filename):
       print(filename)
       with open(filename, "r", encoding='utf-8') as f:
           data = json.load(f)
       return data  # returns array with dictionaries inside

   def empty_file(self):
       with open(self.output_files,"w") as e:
           e.write("")
    
   def libraries(self):
        with open(self.output_files, "a") as c:
            c.write("#include <Stepper.h>\n#include <Servo.h>\n#include <LED.h>\n\n")

   def setup_parse_global(self,data): # before setup function
        with open(self.output_files, "a") as s:
            if data[0]:
                for k,v in data[0].items():
                    s.write(f"Stepper {k}(100,{v[0][1:]},{v[1][1:]},{v[2][1:]},{v[3][1:]});\n")  
            
            if data[1]:
                for k in data[1].keys():
                    s.write(f"Servo {k};\n")

   def setup_parse_function(self,data):  #inside setup function
        with open(self.output_files, "a") as s:
            s.write("void setup() {\n\n")
            if data[0]:
                for k in data[0].keys():
                    s.write(f"{k}.setSpeed(100);\n")
            if data[1]:
                for k,v in data[1].items():
                    s.write(f"{k}.attach({v[1:]});\n")
            if data[2]:
                for v in data[2].values():
                    s.write(f"pinMode({v[1:]}, INPUT);\n")
            
            if data[3]:
                for v in data[3].values():
                    s.write(f"pinMode({v[1:]}, OUTPUT);\n")
            
            s.write("}\n\n")


   def action_parse(self,data):
       with open(self.output_files, "a") as c:
            c.write("void loop() {\n\n")
            def loopy(data):
                for i in data:
                    type_ = i["type"]
                
                    if (type_ == "pin_write"):
                        if (i["value"] == "on"):
                            c.write(f"digitalWrite({i["pin"][1:]}, HIGH);\n") 
                        if (i["value"] == "off"):
                            c.write(f"digitalWrite({i["pin"][1:]}, LOW);\n")

                    if (type_ == "set_variable"):
                        c.write(f"{i["name"]} = {i["value"]};\n")

                    if (type_ == "loop"):
                        c.write(f"for (int v=0; v<= {i["times"]}; v++)")
                        c.write("{\n")
                        loopy(i["children"])
                        c.write("}\n\n")

                    if (type_ == "servo"):
                        c.write(f"{i["name"]}.write({i["angle"]});\n")
                        c.write(f"delay(100);\n")
                    if (type_ == "motor"):
                        c.write(f"{i["name"]}.step(100);\n")
                        # c.write(f"delay(200);\n")

                    if (type_ == "output"):
                        c.write(f"{i["to_var"]} = digitalRead({i["from_pin"][1:]});\n")

                    if (type_ == "define_variable"):
                        c.write(f"int {i["name"]};\n")

                    if (type_ == "if"):
                        c.write(f"if({i["condition"]})")
                        c.write("{\n")
                        loopy(i["then"])
                        c.write("}\n\n")
                        c.write("else")
                        c.write("{\n")
                        loopy(i["else"])
                        c.write("}\n\n")


            loopy(data)
            c.write("}\n")
              

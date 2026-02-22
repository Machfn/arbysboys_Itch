import subprocess

class Finish:
    def __init__(self, directory):
        self.initialized = True
        self.directory = directory
        self.board = None

    def find_board(self):
        result = subprocess.run(["arduino-cli", "board", "list"], capture_output=True, text=True)
        exists = result.stdout != "No boards found.\n"
        if exists:
            r_arr = result.stdout.split("\n")[1].split(" ")
            # print(r_arr)
            fqbn = r_arr[len(r_arr) - 2]
            com = r_arr[0]
            # print(f"COM: ${com}")
            # print(f"fqbn: ${fqbn}")
            subprocess.run(["arduino-cli", "compile", "--fqbn", fqbn, self.directory])
            subprocess.run(["arduino-cli", "upload", "-p", com, "--fqbn", fqbn, self.directory])
            return True
        else:
            return False



# t = Finish()
# t.find_board()
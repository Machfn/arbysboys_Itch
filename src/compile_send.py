import subprocess

class Finish:
    def __init__(self, directory):
        self.initialized = True
        self.board = None

    def find_board(self):
        result = subprocess.run(["arduino-cli", "board", "list"], capture_output=True, text=True)
        exists = result.stdout != "No boards found.\n"
        print(exists)
        r_arr = result.stdout.strip().split(" ")
        fqbn = r_arr[len(r_arr) - 2]
        print(fqbn)



t = Finish("t")
t.find_board()
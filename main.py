import os
from src.gui import GUI

def main():
    path_to_home = os.path.join(os.getcwd(), "./view/home/index.html")
    path_to_second = os.path.join(os.getcwd(), "./view/layout/layout.html")
    path_to_third = os.path.join(os.getcwd(), "./view/editor/index.html")
    gui = GUI(path_to_home, path_to_second, path_to_third, "Itch", (1000, 800)) # Test Replace this later
    gui.start()


if __name__ == "__main__":
    main()
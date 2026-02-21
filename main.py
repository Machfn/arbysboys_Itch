import os
from src.gui import GUI

def main():
    gui = GUI(None, "./view/home/index.html", "Test", (1500, 1000)) # Test Replace this later
    gui.start()


if __name__ == "__main__":
    main()
import os
from src.gui import GUI

def main():
    path_to_html = os.path.join(os.getcwd(), "./templates")
    path_to_assets = os.path.join(os.getcwd(), "./static")
    json_location = os.path.join(os.getcwd(), "./src/")
    gui = GUI(path_to_html, path_to_assets, json_location, "Itch", (1000, 800)) # Test Replace this later
    gui.start()


if __name__ == "__main__":
    main()
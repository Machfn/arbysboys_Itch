class ExposedAPI:
    def __init__(self):
        self.enabled = True
        self.pin_defs = None
        self.instructions = None

    def send_instruction_set(self, pin_defs, instructions):
        # send this to conversion layer
        print(instructions)
        print(pin_defs)
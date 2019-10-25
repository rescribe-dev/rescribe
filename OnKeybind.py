from tkinter import *
from dotParser import DotParser
root = Tk()

parser = DotParser()
#parser.dottin("./sampleCode.java")
def key(event):
    #print("pressed", str(repr(event.char)))
    print(parser.dottin("./sampleCode.java"))

def DOTTO(event):
    print("5.1")
    print(parser.dottin("./sampleCode.java"))

w = Canvas(root, width=300, height=300)

#w.bind("<Key>", key)
w.focus_set()
w.bind("<Control-Key-d>", DOTTO)
#w.bind("<1>", lambda event: w.focus_set())
w.pack()
root.mainloop()
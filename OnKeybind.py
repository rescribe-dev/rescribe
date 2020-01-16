from tkinter import *
from scriber import Scriber
from rescriber import Rescriber

root = Tk()

parser = Scriber()
#parser.dottin("./sampleCode.java")
def key(event):
    #print("pressed", str(repr(event.char)))
    r = Rescriber("sampleCode.java", parser.rescribe("sampleCode.java"))
    r.replaceWithDictionary()
def DOTTO(event):
    print("5.1")
    print("Complete?")
    r = Rescriber("sampleCode.java", parser.rescribe("sampleCode.java"))
    r.replaceWithDictionary()
w = Canvas(root, width=300, height=300)

#w.bind("<Key>", key)
w.focus_set()
w.bind("<Control-Key-d>", DOTTO)
#w.bind("<1>", lambda event: w.focus_set())
w.pack()
root.mainloop()

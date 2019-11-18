import os
import tkinter as tk

root = tk.Tk()
canvas1 = tk.Canvas(root, width = 300, height = 300, bg = 'gray90', relief = 'raised')
canvas1.pack()
def vscode ():
	os.system('cmd /c "code --install-extension vs-0.0.1.vsix"')

button1 = tk.Button(text='  Install reScribe for VS Code  ', command=vscode, bg='green', fg='white', font=('helvetica', 12, 'bold'))
canvas1.create_window(150, 150, window=button1)

root.mainloop()
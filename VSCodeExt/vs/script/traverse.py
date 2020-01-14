import json
import PySimpleGUI as sg

class Traverse:
	def __init__(self, path):
		self.path = path
	def search(self, path):
		#load command dict
		print('Beginning search process...')
		commands = json.load(open(path))

		sg.theme('DarkAmber')   # Make Window in dark mode

		#Create the layout of the window
		layout = [  [sg.Text('reScribe Simple Command Search')],
					[sg.Text('Enter Command Here'), sg.InputText()],
					[sg.Button('Search'), sg.Button('Close')] ]

		# Create the Window
		window = sg.Window('reScribe Search', layout)
		# Event Loop to process "events" and get the "values" of the inputs
		#set command window to not be active
		cw_active = False
		while True:
			event, values = window.read()
			if event in (None, 'Close'):   # if user closes window or clicks cancel
				break
			print('Searching for commmand: ', values[0])
			found = False
			#search for request in command dict
			for (k, v) in commands.items():
				if values[0] == k:
					found = True
			#Command found
			if not cw_active and found:
				print("Command found!")
				#Print the code block the commmand relates to
				print("Function:\n" + str(v))
				#Create Window that displays command format:
				cw_active = True
				window.Hide()
				layout2 = [ [sg.Text('Command: ' + values[0])],
							[sg.Text('Code: ')],
							[sg.Text(str(v))],
							[sg.Button('Exit')]]
				cw = sg.Window(values[0], layout2)
			#Command not found
			else:
				print("Command not found in dictionary")
				cw_active = True
				window.Hide()
				layout2 = [ [sg.Text('Command \"' + values[0] + '\" not found')],
							[sg.Button('Exit')]]
				cw = sg.Window(values[0], layout2)
			if cw_active:
				event2, vals2 = cw.Read()
				if event2 in (None , 'Exit'):
					cw_active = False
					window.UnHide()
					cw.Close()
		window.close()
		return

import json
import PySimpleGUI as sg
from fast_autocomplete import AutoComplete
import pyperclip

class Traverse:
	def __init__(self, path):
		self.path = path
	def search(self, path):
		#load command dict
		print('Beginning search process...')
		commands = json.load(open(path))

		sg.LOOK_AND_FEEL_TABLE['reScribe'] = {'BACKGROUND': '#4D4D4D',
												'TEXT': '#3CA0F4',
												'INPUT': '#FFFFFF',
												'TEXT_INPUT': '#707070',
												'SCROLL': '#3CA0F4',
												'BUTTON': ('#3CA0F4', '#707070'),
												'PROGRESS': ('#3CA0F4', '707070'),
												'BORDER': 1, 'SLIDER_DEPTH': 0, 'PROGRESS_DEPTH': 0,
                                        }

		sg.theme('reScribe')   # Make Window in dark mode

		commandList = [[k,v] for (k, v) in commands.items()]
		#create empty dict for autocomplete
		words = {}
		#Create the layout of the window

		#Create layout sizing:
		length = 1000
		height = 500

		col = []
		combo = []
		for (k, v) in commands.items():
			#Creates Sidebar of buttons for each command in the dict
			col += [[sg.Button(k, key = k, font = ('Courier', 12), size = (int(.02*length),int(.005*height)))]]
			#adds each command to the word dict to be used for autocomplete
			words[k] = {}
			combo += [k]
		#loading up the autocomplete options:
		autocomplete = AutoComplete(words=words)

		layout = [  [sg.Text('',size = (int(.001*length), 1)), sg.Text('//..reScribe'), sg.Text('',size = (int(.003*length), 1)), sg.InputCombo(combo, size = (int(.04*length), 1)), sg.Button('Search', size = (int(.02*length), 1))],
					[sg.Column(col), sg.Text('Choose a command from the left to see the format and code it contains. \nAlternatively you can use the search bar above to search for a command.', key = '_display_', font = ('Helvetica', 12), size = (int(.05*length),int(.05*height)))],
					[sg.Button('Close'),sg.Text('',size = (int(.055*length), 1)), sg.Button('Copy Command', key = 'copy')] ]

		# Create the Window
		window = sg.Window('reScribe Search', layout, return_keyboard_events=True, font = ('Courier', 18), size = (length, height))
		
		out_command = ''
		# Event Loop to process "events" and get the "values" of the inputs
		while True:
			event, values = window.read()
			event_found = False
			if event in (None, 'Close'):   # if user closes window or clicks cancel
				event_found = True
				break
			elif event is 'Search':
				event_found = True
				print('Searching for commmand: ', values[0])
				found = False
				#search for request in command dict
				for (k, v) in commandList:
					if values[0] == k:
						found = True
						output = 'Command:\n //..' + k + '\n' + 'Arguments: \n' + 'Code:\n' + v
						break
				if found:
					print("Command found!")
					window['_display_'].update(str(output))
				else:
					print("Command not found!")
					window['_display_'].update("Command " + values[0] + " not found.")
			for k in commandList:
				if event is k[0]:
					event_found = True
					#output = 'Command:\n //..' + k[0] + '\n' + 'Arguments: \n' + 'Code:\n' + k[1]
					out_command = '//..' + k[0] + '()'
					codefix = k[1].split('\n',1)
					output = 'Command:\n\n' + out_command + '\n\n' + 'Code:\n\n' + codefix[1]
					window['_display_'].update(str(output))
					pyperclip.copy('//..' + k[0] + '()')
					break
			if event is 'copy':
				pyperclip.copy(out_command)
			#if not event_found:
			#	loc = window.Location
			#	window['_display_'].update(event)
		window.close()
		return

import json
import sys

#load in user input
request = sys.argv[1]

#load command dict
commands = json.load(open('command_dict.json'))

#print out fuction user requests for
print("Searching for commmand: " + request)

found = False
#search for request in command dict
for (k, v) in commands.items():
	if request == k:
		found = True

#Command found
if found:
	print("Command found!")
	#Print the code block the commmand relates to
	print("Function:\n" + str(v))
#Command not found
else:
	print("Command not found in dictionary")

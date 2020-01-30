from rescriber import Rescriber
from insert_into_dict import get_command_parameters, get_command_contents, load_to_json_command_dict
#import insert_into_dict
#import pull_from_dict
from pull_from_dict import get_insertion_text 
from traverse import Traverse
import sys
import re
# insert into dict regex:
insert_regex = re.compile(r'\/\/\.\.[a-zA-Z0-9\_\-]*\([a-zA-Z0-9\_\-\,\s]*\)')
# pull from dict regex: 
pull_regex = re.compile(r'\/\/\.\.[a-zA-Z0-9\_\-]*\([a-zA-Z0-9\_\-\,]*\)')
if sys.argv[1] == 'reScribe':
	r = Rescriber(sys.argv[2], get_insertion_text(sys.argv[3], sys.argv[2], pull_regex))
	r.replaceWithDictionary()
elif sys.argv[1] == 'traverse':
	t = Traverse(sys.argv[2])
	t.search(sys.argv[2])
elif sys.argv[1] == 'addToDict':
	_, commands, _ = get_command_parameters(sys.argv[3], sys.argv[2], insert_regex)
	command_contents = get_command_contents(sys.argv[3], sys.argv[2], insert_regex)
	load_to_json_command_dict(sys.argv[3], commands[0], command_contents)
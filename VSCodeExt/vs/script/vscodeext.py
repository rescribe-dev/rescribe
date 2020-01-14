from scriber import Scriber
from rescriber import Rescriber
from traverse import Traverse
import sys

if sys.argv[1] == 'reScribe':
	parser = Scriber(sys.argv[3])
	r = Rescriber(sys.argv[2], parser.rescribe(sys.argv[2]))
	r.replaceWithDictionary()
elif sys.argv[1] == 'traverse':
	t = Traverse(sys.argv[2])
	t.search(sys.argv[2])
elif sys.argv[1] == 'addToDict':
	parser = Scriber(sys.argv[3])
	parser.findNewCommands(sys.argv[2])
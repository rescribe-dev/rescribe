from scriber import Scriber
from rescriber import Rescriber
#from traverse import Traverse
import sys
from io import open
if sys.argv[1] == 'reScribe':
	parser = Scriber(sys.argv[3])
	r = Rescriber(sys.argv[2], parser.rescribe(sys.argv[2]))
	r.replaceWithDictionary()
#elif sys.argv[1] == 'traverse':
#	t = Traverse()
#	t.search()
elif sys.argv[1] == 'addToDict':
	parser = Scriber(sys.argv[3])
#	parser.loadCommandDict(sys.argv[3])
	parser.findNewCommands(sys.argv[2])
from scriber import Scriber
from rescriber import Rescriber
from traverseclass import Traverse
import sys
if sys.argv[2] == 'reScribe':
	parser = Scriber()
	r = Rescriber(sys.argv[1], parser.rescribe(sys.argv[1]))
	r.replaceWithDictionary()
elif sys.argv[2] == 'traverse':
	t = Traverse()
	t.search()
elif sys.argv[2] == 'addToDict':
	parser = Scriber()
	parer.findNewCommands(sys.argv[1])
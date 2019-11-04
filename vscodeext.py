from scriber import Scriber
from rescriber import Rescriber
import sys

parser = Scriber()
r = Rescriber(sys.argv[1], parser.rescribe(sys.argv[1]))
r.replaceWithDictionary()
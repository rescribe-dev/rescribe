from dotParser import DotParser
from rescriber import Rescriber
import sys

parser = DotParser()

r = Rescriber("sampleCode.java", parser.dottin("sampleCode.java"))
r = Rescriber(sys.argv[1], parser.dottin(sys.argv[2]))
r.replaceWithDictionary()
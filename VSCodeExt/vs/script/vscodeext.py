from dotParser import DotParser
from rescriber import Rescriber

parser = DotParser()

r = Rescriber("sampleCode.java", parser.dottin("sampleCode.java"))
r.replaceWithDictionary()
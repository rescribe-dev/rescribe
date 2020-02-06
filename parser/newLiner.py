'''
# Takes the input in the input file and replaces the newlines with \ns. Also escapes "s. 
# Main Purpose: Make code from github usable for the website. 
'''
f = open('newLiner.txt')
arrt = []
for i in f.readlines():
    arrt.append(i.strip('\n').replace("\"","\\\""))
bigString = '\\n'.join(arrt)
print(bigString)

    # testProgram.py
    # Version 10.08.2019
    # Author PMARINA + MICHAEL DIGREGORIO
    # input<<input.py

class Rescriber:
    def __init__(self, filepath, replacement_dictionary):
        self.path = filepath
        self.input_file = None
        self.replacement_dictionary = replacement_dictionary
        try:
            self.input_file = open("input.py", "r")
        except:
            print("Opening the file failed.")
            exit(1)

#     def replaceWithDictionary(self):
#         #replacement_dictionary = {6: "4\nrep1 1\nrep1 2\nrep1 3\nrep1 4",8: "2\nrep2 1\nrep2 2", 3:"5\nrep3 1\nrep3 2\nrep3 3\nrep3 4\nrep3 5"}
#         line_offset = 0
#         input_by_line = self.input_file.readlines()
#         for item in sorted(self.replacement_dictionary.items()):
#             key,value = item
#             replacement_by_line = value.split("\n")
#             replacement_length_lines = len(replacement_by_line)
#             first_line_of_replacement = replacement_by_line[0]
# #             replacement_length_lines = int(replacement_by_line[0])
# #             first_line_of_replacement = replacement_by_line[1]
#             input_by_line[key - 1 + line_offset] = first_line_of_replacement + '\n'
#             line_offset -= 1
#             for i in range(0,replacement_length_lines):
#                 input_by_line.insert(key + i + line_offset, replacement_by_line[i+1] + "\n")
#                 line_offset += replacement_length_lines
#         self.input_file.close()
#         try:
#             self.input_file = open("input.py", "w")
#         except:
#             print("Reopening the file for writing failed.")
#             exit(1)
#         self.input_file.writelines(input_by_line)
        
        
        
        
    def replaceWithDictionary(self):
        #replacement dictionary is indxed with line 1 as the start
        initial_offset = 1
        #initialize
        line_offset = 0
        final_input = dict()
        input_by_line = self.input_file.readlines()
        
        #to make sure line numbers are consistent
        for item in sorted(self.replacement_dictionary.items()):
            #original line of the command, the replacement value
            cmd_line, replacement = item
            #array holding the replacement by line of each replacement
            replacement_lines = replacement.split('\n')
            #length of the replacement
            replacement_length = len(replacement_lines)
            #if the replacement dictionary  is empty
            if(replacement_length == 0):
                println("Replacement is empty")
                close()
            else:
                #to account for the first line being a wash in terms of offsetting all of the text in the document
                line_offset += (replacement_length-1)
                
                #for every line in the replacement
                for index, line in enumerate(replacement_lines):
                #dictionary containing the input by line with adjusted line numbers
                #the +1 is to account for python indexing starting at 0 but line numbers starting at 1
                #line_offset handles the change in original line number due to insertions
                #index makes it so that we can insert each replacement line at the correct postion
                    final_input[(cmd_line+1) + line_offset + index] =  line
                self.input_file.close()
                try:
                    self.input_file = open(self.filepath, "w")
                except:
                    print("Reopening the file for writing failed.")
                    exit(1)
                self.input_file.writelines(final_input)     
                    
            
            
    def close(self):
        self.input_file.close()
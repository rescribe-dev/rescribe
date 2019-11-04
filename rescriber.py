    # testProgram.py
    # Version 10.08.2019
    # Author PMARINA + MICHAEL DIGREGORIO
    # 

class Rescriber:
    def __init__(self, filepath, replacement_dictionary):
        
        self.filepath = filepath
        
        self.input_file = None

        self.input_filepath = filepath        
        
        self.replacement_dictionary = replacement_dictionary
        
        try:
            self.input_file = open(filepath, "r")
        except:
            print("Opening the file failed.")
            exit(1)

    def replaceWithDictionary(self):
        #replacement dictionary is indxed with line 1 as the start
        initial_offset = 1
        #initialize
        line_offset = 0
        final_input = dict()
        input_by_line = self.input_file.readlines()
        key_indices = []
        output = []
        input_by_line = self.input_file.readlines()
        old_content_counter = 0
        modified_content_counter = 0
        added_lines = 0
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
                
                key_indices.append((int(cmd_line)+1) + line_offset)
                line_offset += (replacement_length-1)
                added_lines += replacement_length
                #for every line in the replacement
                for line in enumerate(replacement_lines):
                #dictionary containing the input by line with adjusted line numbers
                #the +1 is to account for python indexing starting at 0 but line numbers starting at 1
                #line_offset handles the change in original line number due to insertions
                #index makes it so that we can insert each replacement line at the correct postion
                    final_input[(int(cmd_line)+1) + line_offset] =  line
        for i in range(0, len(output) + added_lines):
            if (i in key_indices):
                output.append(final_input[i])
            else:
                output.append(input_by_line)
        self.input_file.close()
        try:
            print(output)
            self.input_file = open(self.filepath, "w")
            self.input_file.writelines(output)
        except:
            print("Reopening the file for writing failed.")
            exit(1)
        

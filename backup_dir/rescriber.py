    # testProgram.py
    # Version 10.08.2019
    # Author PMARINA
    # 

class Rescriber:
    def __init__(self, filepath, replacement_dictionary):
        
        self.path = filepath
        
        self.input_file = None

        self.input_filepath = filepath        
        
        self.replacement_dictionary = replacement_dictionary
        
        try:
            self.input_file = open(filepath, "r")
        except:
            print("Opening the file failed.")
            exit(1)

    def replaceWithDictionary(self):
        
        #replacement_dictionary = {6: "4\nrep1 1\nrep1 2\nrep1 3\nrep1 4",8: "2\nrep2 1\nrep2 2", 3:"5\nrep3 1\nrep3 2\nrep3 3\nrep3 4\nrep3 5"}
        
        line_offset = 0
        
        input_by_line = self.input_file.readlines()
        
        for item in sorted(self.replacement_dictionary.items()):
            
            key,value = item
            
            replacement_by_line = value.split("\n")
            
            replacement_length_lines = len(replacement_by_line)-1 #the -1 is because we have an empty string after the ending \n
            
            first_line_of_replacement = replacement_by_line[0]
            
            input_by_line[int(key) - 1 + line_offset] = first_line_of_replacement + '\n'
            
            for i in range(0,replacement_length_lines):
                
                input_by_line.insert(int(key) + i + line_offset, replacement_by_line[int(i)] + "\n")
                
           # line_offset += replacement_length_lines-1
            
        self.input_file.close()
        
        try:
            self.input_file = open(self.input_filepath, "w")
        except:
            print("Reopening the file for writing failed.")
            exit(1)
        self.input_file.writelines(input_by_line)
    def close(self):
        self.input_file.close()
        

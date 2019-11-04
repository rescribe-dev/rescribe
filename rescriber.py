# testProgram.py
# Version 10.08.2019
# Author PMARINA
# input<<input.py
import time




class Rescriber:
        def __init__(self, filepath, replacement_dictionary):
                
                self.filepath = filepath
        
                self.input_file = None

                self.input_filepath = filepath        
        
                self.replacement_dictionary = replacement_dictionary
        
                try:
                        self.input_file = open(self.filepath, "r")
                except:
                        print(filepath)
                        exit(1)
        def replaceWithDictionary(self):
            import time

            time_constant = 0

            replacement_dictionary = self.replacement_dictionary

            input_file = None
            print("Start")
            time.sleep(time_constant)
            try:
                input_file = open(self.filepath, "r")
            except:
                print("Opening the file failed.")
                exit(1)
            print("Succeeded Opening input.py")
            time.sleep(time_constant)
            line_offset = 0
            input_by_line = input_file.readlines()
            print("Read Lines")
            time.sleep(time_constant)
            for item in sorted(replacement_dictionary.items()):
                key,value = item
                replacement_by_line = value.split("\n")
                replacement_length_lines = int(replacement_by_line[0])
                first_line_of_replacement = replacement_by_line[1]
                input_by_line[int(key) - 1 + line_offset] = first_line_of_replacement + '\n'
                for i in range(1,replacement_length_lines):
                    input_by_line.insert(int(key) + i + line_offset-1, replacement_by_line[i+1] + "\n")
                line_offset += replacement_length_lines-1
            input_file.close()
            print("Finished Parsing Input and Generated Output")
            time.sleep(time_constant)
            try:
                input_file = open(self.filepath, "w")
            except:
                print("Reopening the file for writing failed.")
                exit(1)
            print("Writing Lines...")
            time.sleep(time_constant)
            input_file.writelines(input_by_line)
            print("Done. Closing File.")
            input_file.close()

    
    

    

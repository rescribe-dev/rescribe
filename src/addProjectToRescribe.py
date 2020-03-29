#This will be a modification of previous code so that we can add enture projects to rescribe instead of going command by command
# we will also be parsing for functions in python in general
# we will add further langiage support after this one is done, ideally it would be through the use of an interchangable 
# regualr expression

import os 
import sys
import re

class Rescribe:

    def __init__(self):
        self.root_filepath = ""
        self.supported_extensions = ["py"]
        self.language = ""
        self.function_regex = [(re.compile(r'def\s[a-zA-Z0-9\-\_]*[\(]([\s]*[a-zA-Z0-9\-\_]*[\s]*[\,])*([\s]*[a-zA-Z0-9\-\_]*[\s]*[\)][\s]*[\:]'), function_contents_regex)]
        self.filepath_list = []

    def _get_file_names(self, root_filepath):
        self.filepath_list = []
        self.root_filepath = root_filepath
        for root, d_names, f_names in os.walk(self.root_filepath):
            for f in f_names:
                self.filepath_list.append(os.path.join(root,f))

############################################################################################################
    def _get_functions(self, file, function_regex):
        """
        This function will take in a list of strings and return all of the characters contained within a "grammatically correct" set of curly braces
        TODO: Use input function regex to find the lines with definitioins on them, after that, count the number of tabs the definition has and use that to find
        the correct contents of that function, make an exception for class keyword where instead you take everything inside of it and dont break for individual functions
        ---
        for languages that arent python (java and c++) make slight modifications to the code so that we can pull out function names and then get the contents of the curly brances
        ---
        will probably support java or c++ first, then python because the python parsing will take longer to develop
        the code below currently is a grammar for the old implementation
        """
        output = []
        grammar_stack = []
        start_delim = "{"
        end_delim = "}"
        reached_beginning = False
        reached_end = False
        for line_index, line in enumerate(file_contents):
            for character_index, character in enumerate(line):
                #if you reach the start delimiter for the first time then save the index of the start delimter and continue on 
                if (character == start_delim) and (reached_beginning == False):
                    reached_beginning = True
                    start = (line_index, character_index)
                    #grammar_stack.append(character)
                #if you've reached the beginning but not the end then start appending characters to the stack
                if (reached_beginning == True) and (reached_end == False):
                    output.append(character)
                    if (character == start_delim):
                        grammar_stack.append(character)
                    if (character == end_delim):

            ###PRIMARY RETURN RESIDES IN THIS "TRY" SECTION - OTHER RETURNS REPRESENT ERRORS###
                        try:
                            grammar_stack.pop()
                            if grammar_stack == []:
                                reached_end = True
                                end = (line_index, character_index)
                                contents = convert(output, start, end)
                                return contents.replace("{", "", 1)
                                
                        except:
                            reached_end = True
                            end = (line_index, character_index)
                            print("There is a syntax error in the rescribe command, check for improper curly brace usage\nReturning start and end coordinates realtive to //..\n Touple (line_number, character_number) - indexed from zero\n")
                            return start, end
                if (reached_beginning == True) and (reached_end == True):
                    print("There is a syntax error in the rescribe command, check for improper curly brace usage\nReturning start and end coordinates realtive to //..\n Touple (line_number, character_number) - indexed from zero\n")
                    return start, end
        print("There is a syntax error in the rescribe command, check for improper curly brace usage\nReturning start and end coordinates realtive to //..\n Touple (line_number, character_number) - indexed from zero\n")
        return start, end
############################################################################################################

    def _add_functions_to_database(self, functions):
        pass

    def add_project(self, root_filepath):
        self._get_file_names(root_filepath)
        for file in self.filepath_list:
            file_extension = file.split(".")[2]
            if file_extension in self.supported_extensions:
                self._add_functions_to_database(self._get_functions(file, self.function_regex[self.supported_extensions.index(file_extension)]))

    



if __name__ == "__main__":
    re = Rescribe()
    # re.get_file_names("./")
    re.get_functions("./")
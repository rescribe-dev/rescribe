##USAGE
#parser = dotParser()
#parser.dottin(file_path)
#Returns a dictionary with the following format:
#{key : contents}
#{line_number_of_command_in_file : code_to_be_inserted_into_file}


class DotParser:
    def __init__(self):
        pass
    def dottin(self, path):
        import re
        #instantiate a dictionary to hold each line of the file as its contents with the line number as its associated key
        file_dict = {}
        #a dictionary containing a list of commands
        command_dict = {"forloop" : "for( &1 in range(&2, &3)):\n\tpass"}
        #A dictionary that will contain the final output
        output_dict = {}

        #a regular expression which can pull out our command format //..command(arg1:arg2:arg3)
        regexp = re.compile(r'\/\/\.\.[a-zA-Z0-9]*\([a-zA-Z0-9\_\-]*:[a-zA-Z0-9\_\-]*:[a-zA-Z0-9\_\-]*\)')
        #regular expression for parsing out our arguments
        arg_raw_regexp = re.compile(r'[a-zA-Z0-9]*')

        #empty list made to hold the commands
        command = []
        #an empty list instantiated to contain all of the lines of code which do not contain a command
        deleted_entries = []
        #empty list containing all of the raw arguments
        args_raw = []
        arg1 = []
        arg2 = []
        arg3 = []
        #output strings
        return_strings = []

        #the digits 0-9
        digits = ['0','1', '2', '3', '4', '5', '6', '7', '8', '9']
        #delimiters for arguments 1, 2, and 3
        args_delim = ["&1", "&2", "&3"]
        #list of the arguments which will be used
        args = [arg1, arg2, arg3]

        #counter to hold the index the command ends at
        cmd_end_counter = 0 
        #counter to get the position of the last char of the command and the start of the arguments
        arg_start_counter = 4
        #line number counter
        line_number = 1

        #DOTTIN Delimiter
        DOTTIN = "//.."
        #start of where the args are
        arg_start_delim = "("
        #filepath
        path = "../sampleCode.java"


        #Open the file at the specified path and proceed to create a dictionary of the format:
        #key = line number ::: contents = line contents
        file_contents = open(path)          
        for line in file_contents:   
            file_dict[str(line_number)] = file_contents.readline()
            line_number += 1

        #Search through the file content dictionary and remove any entries which do not contain
        #commands. Remove the whitespace from those that do
        for key in file_dict:    
            if(regexp.search(file_dict[key])):
                file_dict[key] = file_dict[key].strip()
                pass
            else:
                deleted_entries.append(key)
        for entry in deleted_entries:
            del file_dict[entry]
        file_dict

        #split the input string to parse out the command and the arguments part
        #note: args_raw contains args as &1:&2:&3) instead of (&1:&2:&3)
        for key in file_dict:
            tempStr = file_dict[key].split("//..")[1]
            command.append(tempStr.split("(")[0])
            args_raw.append(tempStr.split("(")[1])

        #split args raw up along : and place them into the args
        for i in args_raw:
            arg1.append(i.split(":")[0])
            arg2.append(i.split(":")[1])
            arg3.append(i.split(":")[2][:-1])

        #set the output string by using the command as a key in the command dictionary
        for index, commands in enumerate(command):
            tempStr = command_dict[commands]
            for i, arguments in enumerate(args):
                tempStr = tempStr.replace(args_delim[i], args[i][index])
            return_strings.append(tempStr)

        for index, key in enumerate(file_dict):
            output_dict[key] = return_strings[index]

        return(output_dict)
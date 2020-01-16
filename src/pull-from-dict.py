##USAGE
#parser = Scriber()
#parser.rescribe(file_path)
#Returns a dictionary with the following format:
#{key : contents}
#{line_number_of_command_in_file : code_to_be_inserted_into_file}



def create_file_dict(file_path):
    """
    This funciton will make a dictionary out of the text file passed to it with the key value pair:
    {"line_number" : "line_contents"}
    """
    file_dict = {}
    line_number = 1
    file_contents = open(file_path).read().split('\n')

    for line in file_contents:
        file_dict[str(line_number)] = line
        line_number += 1

    return file_dict

def parse_dict_for_lines_with_commands(file_dict, regular_expression):
    """
    This function will parse a dictionary passed into it for lines matching the regular expression passed into it
    It will then return a list of the commands and a list of arguments
    It will also strip out all whitespace from the line
    commands, args_raw
    """
    commands = []
    args = []
    for key in file_dict:
        if (regular_expression.search(file_dict[key])):
            file_dict[key] = file_dict[key].strip()
            temp_str = file_dict[key].split("//..")[1]
            commands.append(temp_str).split("(")[0]
            args.append(temp_str).split("(")[1].split(")")[0]
        else:
            del file_dict[key]
    
    return commands, args




def rescribe_init(dict_path, file_path){
    import re
    import json

    file_dict = {}  #dict to hold each line of the input file  

    try:
        command_dict = self.loadCommandDict(self.path) #a dictionary containing a list of commands
    except:
        print("unable to load command dictionary")
        return

    #{"forloop" : "2\nfor( &1 in range(&2, &3)):\n\tpass\n"}
    output_dict = {} #contains the final output

    #command format //..command(arg1:arg2:arg3)
    regexp = re.compile(r'\/\/\.\.[a-zA-Z0-9\_\-]*\([a-zA-Z0-9\_\-]*:[a-zA-Z0-9\_\-]*:[a-zA-Z0-9\_\-]*\)')
    #regular expression for parsing out our arguments
    arg_raw_regexp = re.compile(r'[a-zA-Z0-9]*')

    command = [] #holds the commands
    deleted_entries = []  #holds lines of code which do not contain commands

    args_raw = []  #contains the raw arguments
    arg1 = []
    arg2 = []
    arg3 = []
    args = [arg1, arg2, arg3]

    return_strings = []  #output strings

    digits = ['0','1', '2', '3', '4', '5', '6', '7', '8', '9']
    args_delim = ["&1", "&2", "&3"]   #delimiters for arguments 1, 2, and 3
    
    cmd_end_counter = 0   #holds the index the command ends at
    arg_start_counter = 4  #holds the positin of the last char of the command and the start of the args
    line_number = 1  #line number counter

    #DOTTIN Delimiter
    DOTTIN = "//.."
    arg_start_delim = "("   #start of where the args are

    #filepath
    #path = "../sampleCode.java"

}


#######################################################################################################################################################
class Scriber:
    def __init__(self, path):
        self.path = path
        
    def addNewToDictionary(self, command, contents, encoding='utf-8', errors='ignore'):
        import json
        path = self.path
        command_dict = self.loadCommandDict(self.path)
        count = contents.count('\n')
        contents = str(count) + contents
        #if the command does not exist in the dictonary then append it to the command dictionary
        if ~(command in command_dict.keys()): 
            command_dict[command] = contents
        else:
        #if that command exists in the dictoinary tell the user and then overwrite
            print("Replacing command: %s's contents: %s with %s" % (command, command_dict[command], contents))
            command_dict[command] = contents
        #print('')
        #print("Command Dict: ")
        #print(command_dict)
        #print('')
        #open the old file back up and write the updates contents into it, otherwise tell the user you can't and exit
        #original dictionary shouldn't be modified
        try:
            with open("command_dict.json", "w", encoding=encoding, errors=errors) as json_file:
                json.dump(command_dict, json_file)
                #json_file.write("lets hope")
            print("Successfully wrote to dictionary")
            return 0
        except:
            print("Cannot reopen json file to write new commands to it")
            print("Expected Command: " + command)
            print("Expected Contents: " + contents)
            
            print(self.path)
            return 1
        
    def loadCommandDict(self, path, encoding='utf-8', errors='ignore', strict=False):
        #file imports
        import json
        #open the file with the command dictionary in it, be sure to use the proper encoding or you will get a 
        #JSON Error akin to: JSONDecodeError: Expecting value: line 1 column 1 (char 0)
        try:
            with open(path, encoding=encoding, errors=errors) as json_data:
                command_dict = json.load(json_data, strict=strict)
            return command_dict
        except:
            print("There was an error retrieving the command dictionary")
            return
        
    def findNewCommands(self, path):
        import re
        #the first part of this will be exceedingly similar to the first part of rescribe, however, we will not need to
        #store line numbers, just the contents of the add new command block
        file_dict = {}
        
        #load the command dictionary
        try:
            command_dict = self.loadCommandDict(self.path)
        except:
            print("There was an error loading the command dictionary")
        
        output_dict = {}
        
        #regular expression to pull out //..commandName(*whatever*)   {code}
        regexp = re.compile(r'\/\/\.\.[a-zA-Z0-9\_\-]*\([a-zA-Z0-9\_\-\,]*\)[\t\s]*\{[a-zA-Z0-9\_\-\t\s\!\@\#\$\%\^\&\*\(\)\+\=\?\>\<\'\;\:\"\]\[\`\~]*\}')
        
        command = []
        code= []
        
        code_start_delim = '{'
        command_end_delim = '('
        
        file_contents = open(path).read()
        
        raw_additions = regexp.search(file_contents)
        print(raw_additions.group())
        #print(file_contents)
        if(raw_additions == None):
            print("No new commands to be added, make sure your commands are formatted properly")
        else:
            #print(raw_additions.group())
            command = raw_additions.group().split('(')[0]
            command = command.split('..')[1]
            contents = raw_additions.group().split('{')[1].strip('}')
            print("\nCommand: " + command)
            self.addNewToDictionary(command, contents)
        
    def rescribe(self, path):
        import re
        #instantiate a dictionary to hold each line of the file as its contents with the line number as its associated key
        file_dict = {}
        #a dictionary containing a list of commands
        try:
            command_dict = self.loadCommandDict(self.path)
        except:
            print("unable to load command dictionary")
            return
        #{"forloop" : "2\nfor( &1 in range(&2, &3)):\n\tpass\n"}
        #A dictionary that will contain the final output
        output_dict = {}

        #a regular expression which can pull out our command format //..command(arg1:arg2:arg3)
        regexp = re.compile(r'\/\/\.\.[a-zA-Z0-9\_\-]*\([a-zA-Z0-9\_\-]*:[a-zA-Z0-9\_\-]*:[a-zA-Z0-9\_\-]*\)')
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
        #path = "../sampleCode.java"


        #Open the file at the specified path and proceed to create a dictionary of the format:
        #key = line number ::: contents = line contents
        file_contents = open(path).read().split('\n')
        #file_contents = open(path)          
        for line in file_contents:   
            #file_dict[str(line_number)] = file_contents.readline()
            #the -1 is to offset the fact that line number starts at 1
            #adn python indexing starts at 0
            file_dict[str(line_number)] = file_contents[line_number-1]
            line_number += 1
#         for key in file_dict:
#             print(file_dict[key])
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

        # print(arg1)
        # print(arg2)
        # print(arg3)
        # print(return_strings)

        # for i in return_strings:
        #     print(i)

        # for key in file_dict:
        #     print(key)
        # print(file_dict)


        for index, key in enumerate(file_dict):
            output_dict[key] = return_strings[index]

        return(output_dict)
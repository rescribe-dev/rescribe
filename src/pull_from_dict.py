##USAGE
# import re
# regexp = re.compile(r'\/\/\.\.[a-zA-Z0-9\_\-]*\([a-zA-Z0-9\_\-]*:[a-zA-Z0-9\_\-]*:[a-zA-Z0-9\_\-]*\)')
# insertion_text = get_insertion_text("command_dict.json", "sampleCode.java", regexp)
# insertion_text is a dictionary of format {"line_number" : "content"}


def load_command_dict(file_path, encoding="utf-8", errors='ignore', strict=False):
    import json
    """
    This function will load a JSON file into a python dictionary. The intended use is to load the dictionary 
    of rescribe commands.
    """
    try:
        with open(file_path, encoding=encoding, errors=errors) as file:
            command_dict = json.load(file, strict=strict)
        return command_dict
    except:
        print("Either you can't open the command dict or there is a problem with json.load(path, strict=strict)")
        return 

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
    It will then return the modified file_dict, a list of the commands and a list of arguments
    It will also strip out all whitespace from the line
    file_dict, commands, args_raw
    """
    commands = []
    lines_to_kill = []
    for key in file_dict:
        if (regular_expression.search(file_dict[key])):
            file_dict[key] = file_dict[key].strip()
            temp_str = file_dict[key].split("//..")[1]
            commands.append(temp_str.split("(")[0])
            args = temp_str.split("(")[1].split(")")[0]
        else:
            lines_to_kill.append(key)
    
    for key in lines_to_kill:
        del file_dict[key]

    return file_dict, commands, args

def get_insertion_text(command_path, file_path, regular_expression):
    """
    This function will take in the file path and regular expression and then return the 
    text to be inserted to the text document
    {"command":"output_from_command_dict"}
    """
    try:
        file_dict = create_file_dict(file_path)
    except:
        print("error retrieving the file dicitonary")
        return

    #try:
    file_dict, commands, args = parse_dict_for_lines_with_commands(file_dict, regular_expression)
    args = args.split(':')
    #except:
        #print("failed to parse the file dictionary for commands")
        #return 

    return_strings = []
    output_dict = dict()
    args_delim = ["&1", "&2", "&3", "&4", "&5", "&6", "&7"]

    command_dict = load_command_dict(command_path)

    for index, command in enumerate(commands):
        temp_str = command_dict[command]
        for i, _ in enumerate(args):
            temp_str = temp_str.replace(args_delim[i], args[i])
        return_strings.append(temp_str)

    for index, key in enumerate(file_dict):
        output_dict[key] = return_strings[index]
    
    return output_dict


if __name__ == "__main__":
    import re
    regexp = re.compile(r'\/\/\.\.[a-zA-Z0-9\_\-]*\([a-zA-Z0-9\_\-]*:[a-zA-Z0-9\_\-]*:[a-zA-Z0-9\_\-]*\)')
    insertion_text = get_insertion_text("command_dict.json", "sampleCode.java", regexp)
    print(insertion_text)
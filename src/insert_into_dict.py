from pull_from_dict import load_command_dict, create_file_dict, parse_dict_for_lines_with_commands


def get_command_parameters(command_path, file_path, regular_expression):
    """
    This will return the lines of the commands, the command, and the arguments
    currently this only works for one command
    """
    try:
        file_dict = create_file_dict(file_path)
    except:
        print("Error creating the file dict")
        return
    
    try:
        command_dict = load_command_dict(command_path)
    except:
        print("Error loading the command dict")
        return 

    try:
        file_dict, command, args_raw = parse_dict_for_lines_with_commands(file_dict, regular_expression)
    except:
        print("Error parsing the file dict")
        return 

    # file_dict = create_file_dict(file_path)
    # command_dict = load_command_dict(command_path)
    # file_dict, command, args_raw = parse_dict_for_lines_with_commands(file_dict, regular_expression)
    return next(iter(file_dict)), command, args_raw[0].split(',')
    
def get_command_contents(command_path, file_path, regular_expression):
    """
    This function will return the contents of the rescribe command-to-be as a string
    """
    MAX_LINES = 500
    try:
        line_number, command, args = get_command_parameters(command_path, file_path, regular_expression)
        line_number = int(line_number) - 1
    except:
        print("Error with the function get_command_parameters")
        return 

    with open(file_path, encoding="utf-8", errors='ignore') as file:
        file_contents = file.readlines()    

        for index, line in enumerate(file_contents):
            if index < line_number:
                continue
            elif index == line_number:
                if(len(file_contents) > (line_number + MAX_LINES + 1)):
                    command_contents = grammar_parser(file_contents[line_number : (line_number + MAX_LINES)])
                    break
                else:
                    command_contents = grammer_parser(file_contents[line_number:])
                    break
            else: 
                return

    return command_contents

if __name__ == "__main__":
    import re
    regexp = re.compile(r'\/\/\.\.[a-zA-Z0-9\_\-]*\([a-zA-Z0-9\_\-\,\s]*\)')
    line_numbers, commands, args = get_command_parameters("command_dict.json", "sampleCode.java", regexp)
    print("Line Numbers: ", line_numbers, " Commands: ", commands, " args: ", args)

    #get_command_contents("command_dict.json", "sampleCode.java", regexp)
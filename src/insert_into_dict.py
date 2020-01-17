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
    return file_dict.keys(), command, args_raw
    




if __name__ == "__main__":
    import re
    regexp = re.compile(r'\/\/\.\.[a-zA-Z0-9\_\-]*\([a-zA-Z0-9\_\-\,\s]*\)')
    line_numbers, commands, args_raw = get_command_parameters("command_dict.json", "sampleCode.java", regexp)
    print("Line Numbers: ", line_numbers, " Commands: ", commands, " args_raw: ", args_raw)
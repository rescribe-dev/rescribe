from os import listdir


def list_files(directory, extension):
    """
    list files
    """
    return (f for f in listdir(directory) if f.endswith('.' + extension))

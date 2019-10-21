# testProgram.py
# Version 10.08.2019
# Author PMARINA
# input<<input.py
import time

time_constant = 0.75

replacement_dictionary = {6: "2\nfor i in range(1:10:1)\n\tpass"}

input_file = None
print("Start")
time.sleep(time_constant)
try:
    input_file = open("input.py", "r")
except:
    print("Opening the file failed.")
    exit(1)
print("Succeeded Opening input.py")
time.sleep(time_constant)
line_offset = 0
input_by_line = input_file.readlines()
print("Read Lines")
time.sleep(time_constant)
for key, value in replacement_dictionary.items():
    replacement_by_line = value.split("\n")
    replacement_length_lines = int(replacement_by_line[0])
    first_line_of_replacement = replacement_by_line[1]
    input_by_line[key - 1] = first_line_of_replacement
    for i in range(replacement_length_lines - 1):
        input_by_line.insert(key + i + 1 + line_offset, replacement_by_line[i + 1] + "\n")
    line_offset += replacement_length_lines
input_file.close()
print("Finished Parsing Input and Generated Output")
time.sleep(time_constant)
try:
    input_file = open("input.py", "w")
except:
    print("Reopening the file for writing failed.")
    exit(1)
print("Writing Lines...")
time.sleep(time_constant)
input_file.writelines(input_by_line)
print("Done. Closing File.")
input_file.close()

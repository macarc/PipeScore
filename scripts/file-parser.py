# import required module
import os
import re
import csv

# open the file in the write mode
# csv_file = open('C:\\Users\\benja\\Downloads\\bww-file-tune-format.csv', 'w', newline='')
csv_file = open('C:\\Users\\benja\\Downloads\\bww-file-tune-strings.csv', 'w', newline='')
writer = csv.writer(csv_file)
writer.writerow(['tune_id', 'regex_match', 'string', 'char_1', 'char_2']);



# assign directory
directory = "C:\\Users\\benja\\Downloads\\bww-files"
# pattern = re.compile("TuneFormat,\(\d,\d,([a-zA-Z]*),([a-zA-Z]*),\d{3,4},\d{3,4},\d{3,4},\d{3,4},([a-zA-Z]*),\d,\d\)")
pattern = re.compile("^\"([^\"]*)\",\((\w),(\w),\d{1,2},\d{1,2},[^,]*,\d{1,2},\d{1,3},\d{1,3},\d,\d{1,2},\d,\d,\d\)")
# iterate over files in

id = 0

# that directory
for filename in os.listdir(directory):
    f = os.path.join(directory, filename)
    pattern_found = False;
    if os.path.isfile(f):
        for i, line in enumerate(open(f)):
            match = pattern.match(line)
            if match:
                writer.writerow([id, match.group(0), match.group(1), match.group(2), match.group(3)])
                pattern_found = True

    id += 1
    if not pattern_found:
        print("Pattern was not found in file: %s" % f)


csv_file.close()
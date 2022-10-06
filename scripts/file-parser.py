# import required module
import os
import re
import csv

# open the file in the write mode
csv_file = open('C:\\Users\\benja\\Downloads\\bww-file-tune-format.csv', 'w', newline='')
writer = csv.writer(csv_file)
writer.writerow(['String Match', 'Char #1', 'Char #2', 'Char #3']);



# assign directory
directory = "C:\\Users\\benja\\Downloads\\bww-files"
pattern = re.compile("TuneFormat,\(\d,\d,([a-zA-Z]*),([a-zA-Z]*),\d{3,4},\d{3,4},\d{3,4},\d{3,4},([a-zA-Z]*),\d,\d\)")
# iterate over files in


# that directory
for filename in os.listdir(directory):
    f = os.path.join(directory, filename)
    pattern_found = False;
    if os.path.isfile(f):
        for i, line in enumerate(open(f)):
            match = pattern.match(line)
            if match:
                writer.writerow([match.group(0), match.group(1), match.group(2), match.group(3)])
                # pattern_found = True

    # if not pattern_found:
    #     print("Pattern was not found in file: %s" % f)


csv_file.close()
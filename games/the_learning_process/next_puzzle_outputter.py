#Arg 1: number of things
#Arg 2: a or b
import sys

for i in range(10, int(sys.argv[1])):
	print("puzzle_"+str(i)+sys.argv[2]+".nextPuzzle = puzzle_"+str(i+1)+sys.argv[2]+";")
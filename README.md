
# Sudoku Solver JS

Solves 9x9 Sudoku puzzles. The solver uses Dr. Donald Knuth's Dancing Links algorithm, which makes 
quick and efficient.

## Samples

To execute the samples, run the following command

Sample 1
    node lib/solver.js $(head -n1 samples.txt | tail -n1)

Sample 2
	node lib/solver.js $(head -n2 samples.txt | tail -n1)
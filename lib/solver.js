(function(){
"use strict";

var latinSquare = require('./latinsquare'),
	sudoku = require('./sudoku'),
	exactcover = require('./exactcover');

//create a sudoku matrix
var matrix = sudoku.createMatrix();

//set the default values for the sudoku puzzle
matrix.setValue(0, 0, 5);
matrix.setValue(1, 0, 3);
matrix.setValue(4, 0, 7);
matrix.setValue(0, 1, 6);
matrix.setValue(3, 1, 1);
matrix.setValue(4, 1, 9);
matrix.setValue(5, 1, 5);
matrix.setValue(1, 2, 9);
matrix.setValue(2, 2, 8);
matrix.setValue(7, 2, 6);
matrix.setValue(0, 3, 8);
matrix.setValue(4, 3, 6);
matrix.setValue(8, 3, 3);
matrix.setValue(0, 4, 4);
matrix.setValue(3, 4, 8);
matrix.setValue(5, 4, 3);
matrix.setValue(8, 4, 1);
matrix.setValue(0, 5, 7);
matrix.setValue(4, 5, 2);
matrix.setValue(8, 5, 6);
matrix.setValue(1, 6, 6);
matrix.setValue(6, 6, 2);
matrix.setValue(7, 6, 8);
matrix.setValue(3, 7, 4);
matrix.setValue(4, 7, 1);
matrix.setValue(5, 7, 9);
matrix.setValue(8, 7, 5);
matrix.setValue(4, 8, 8);
matrix.setValue(7, 8, 7);
matrix.setValue(8, 8, 9);

//create a 2x2 latin square matrix
//var matrix = latinSquare.createMatrix(2);

//solve the matrix
var solutions = exactcover.solve(matrix);

//print out each of the solutions
solutions.forEach(function(solution, index) {
	console.log('solution #' + (index + 1));
	solution.forEach(function(choice) {
		console.log('\t' + choice.name);
	});
});

}).call(this);
(function(args){
"use strict";

var util = require('util'),
    latinSquare = require('./latinsquare'),
	sudoku = require('./sudoku'),
	exactcover = require('./exactcover');

//ensure that the given string is specified
if(args.length != 1) {
	console.log('No puzzle found specified.\n' + 
		'Please specify the puzzle to solved as an argument. The format is a string of\n' + 
		'consecutive numbers for the given values of the puzzle with zeroes, dashes, or\n' +
		'spaces as blanks.');
	return;
}

//create a sudoku matrix
var givenValue = args[0];
var matrix = sudoku.createMatrixFromString(givenValue);

//create a 2x2 latin square matrix
//var matrix = latinSquare.createMatrix(2);

//solve the matrix
var timeBefore = process.hrtime();
var solutions = exactcover.solve(matrix);

//print out each of the solutions
var timeTaken = process.hrtime(timeBefore);
console.log('Found ' + solutions.length + ' solution in %d.%d seconds', timeTaken[0], timeTaken[1]);
solutions.forEach(function(solution, index) {
	console.log('solution #' + (index + 1));

	//choices for the solution are given in the order that they were found however it's not 
	//easy to follow for humans. let's sort the choices by row then column
	var sortedChoices = new Array(9);

	matrix.selectedChoices.concat(solution).forEach(function(choice) {
		var sortedColumns = sortedChoices[choice.rowIndex];
		if(!util.isArray(sortedColumns)) {
			sortedColumns = sortedChoices[choice.rowIndex] = new Array(9);
		}
		sortedColumns[choice.columnIndex] = choice.value;
	});

	//print out the solution
	sortedChoices.forEach(function(sortedColumns) {
		if(!sortedColumns) {
			console.log('000000000');
			return;
		}

		var rowString = '';
		for(var columnIndex = 0; columnIndex < sortedColumns.length; columnIndex++) {
			var value = sortedColumns[columnIndex];
			if(typeof value === 'undefined') {
				rowString += '0';
			} else {
				rowString += value;
			}
		}
		console.log(rowString);
	});
});

}).call(this, process.argv.slice(2));
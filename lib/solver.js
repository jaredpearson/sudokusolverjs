(function(){
"use strict";

var latinSquare = require('./latinsquare'),
	sudoku = require('./sudoku'),
	exactcover = require('./exactcover');

//create a sudoku matrix
var givenValue = '530070000' + 
                 '600195000' + 
                 '098000060' + 
                 '800060003' + 
                 '400803001' +
                 '700020006' + 
                 '060000280' +
                 '000419005' +
                 '000080079';
var matrix = sudoku.createMatrixFromString(givenValue);

//create a 2x2 latin square matrix
//var matrix = latinSquare.createMatrix(2);

//solve the matrix
var timeBefore = process.hrtime();
var solutions = exactcover.solve(matrix);

//print out each of the solutions
var timeTaken = process.hrtime(timeBefore);
console.log('Found ' + solutions.length + ' in %d.%d seconds', timeTaken[0], timeTaken[1]);
solutions.forEach(function(solution, index) {
	console.log('solution #' + (index + 1));
	solution.forEach(function(choice) {
		console.log('\t' + choice.name);
	});
});

}).call(this);
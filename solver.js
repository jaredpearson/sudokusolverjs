(function(){
"use strict";

var latinSquare = require('./latinsquare'),
	exactcover = require('./exactcover');

//create a 2x2 latin square matrix
var matrix = latinSquare.createMatrix(2);

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
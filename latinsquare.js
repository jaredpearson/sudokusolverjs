(function() {
"use strict";

//setup the module
var latinSquare;
if(typeof exports !== 'undefined') {
	latinSquare = exports;
} else {
	latinSquare = this.latinSquare = {};
}

var exactcover = require('./exactcover');

/**
 * Creates all of the constraints for the latin square
 */
function createConstraints(columnSize, rowSize, values) {
	var rowIndex, 
		columnIndex, 
		constraint,
		constraintProto = {},
		constraints = [];

	var cellConstraintSatisfies = function(choice) {
		return this.columnIndex === choice.columnIndex && this.rowIndex === choice.rowIndex;
	};

	//a value must be in every cell
	for(columnIndex = 0; columnIndex < columnSize; columnIndex++) {
		for(rowIndex = 0; rowIndex < rowSize; rowIndex++) {
			constraint = exactcover.createConstraint(cellConstraintSatisfies);
			constraint.name = 'value must be in (' + columnIndex + ', ' + rowIndex + ')';
			constraint.rowIndex = rowIndex;
			constraint.columnIndex = columnIndex;
			constraints.push(constraint);
		}
	}

	var columnConstraintSatisfies = function(choice) {
		return this.value === choice.value && this.columnIndex === choice.columnIndex;
	};

	//each value must be in each column
	for(columnIndex = 0; columnIndex < columnSize; columnIndex++) {
		values.forEach(function(value) {
			constraint = exactcover.createConstraint(columnConstraintSatisfies);
			constraint.name = value + ' must be column ' + columnIndex;
			constraint.columnIndex = columnIndex;
			constraint.value = value;
			constraints.push(constraint);
		});
	}

	var rowConstraintSatisfies = function(choice) {
		return this.value === choice.value && this.rowIndex === choice.rowIndex;
	};

	//each value must be in each row
	for(rowIndex = 0; rowIndex < rowSize; rowIndex++) {
		values.forEach(function(value) {
			constraint = exactcover.createConstraint(rowConstraintSatisfies);
			constraint.name = value + ' must be row ' + rowIndex;
			constraint.rowIndex = rowIndex;
			constraint.value = value;
			constraints.push(constraint);
		});
	}

	return constraints;
}

function createChoices(columnSize, rowSize, values) {
	var choices = [],
		choiceProto = {},
		index = 0, 
		columnIndex, 
		rowIndex;

	for(columnIndex = 0; columnIndex < columnSize; columnIndex++) {
		for(rowIndex = 0; rowIndex < rowSize; rowIndex++) {
			values.forEach(function(value){
				var choice = exactcover.createChoice();
				choice.name = value + ' at (' + columnIndex + ', ' + rowIndex + ')';
				choice.value = value;
				choice.columnIndex = columnIndex;
				choice.rowIndex = rowIndex;
				choices.push(choice);
				index++;
			});
		}
	}

	return choices;
}

/**
 * builds the values array, starting with value 1 up to the dimension
 */
function buildValuesArray(dimension) {
	var value, values = [];
	for(value = 1; value < dimension + 1; value++) {
		values.push(value);
	}
	return values;
}

/**
 * Creates a matrix for a latin square. 
 *
 * A latin square is a matix of numbers where each number only occurs
 * once in a row and once in a column.
 */
latinSquare.createMatrix = function(dimension) {

	var rowSize = dimension, 
		columnSize = dimension,

		//create an array of values [1 .. n]
		values = buildValuesArray(dimension),

		//create all of the constraints for the latin square
		constraints = createConstraints(columnSize, rowSize, values),

		//create all of the choices for the latin square
		choices = createChoices(columnSize, rowSize, values);

	return exactcover.createMatrix(constraints, choices);
};

}).call(this);
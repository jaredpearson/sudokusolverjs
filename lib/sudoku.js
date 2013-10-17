(function() {
"use strict";

//setup the module/exports
var sudoku;
if(typeof exports !== 'undefined') {
	sudoku = exports;
} else {
	sudoku = this.sudoku = {};
}

var exactcover = require('./exactcover');

/**
 * Creates all of the values up to the given size
 */
function createValues(size) {
	var values = [], value;

	for(value = 1; value < size + 1; value++) {
		values.push(value);
	}

	return values;
}

function createChoices(size, values) {
	var columnIndex, 
		rowIndex, 
		choices = [];
	for(columnIndex = 0; columnIndex < size; columnIndex++) {
		for(rowIndex = 0; rowIndex < size; rowIndex++) {
			values.forEach(function(value) {
				var choice = exactcover.createChoice();
				choice.name = value + ' at (' + columnIndex + ', ' + rowIndex + ')';
				choice.value = value;
				choice.columnIndex = columnIndex;
				choice.rowIndex = rowIndex;
				choices.push(choice);
			});
		}
	}
	return choices;
}

function createConstraints(size, values) {
	var constraints = [],
		rowIndex,
		columnIndex;

	//each row must have one (and only one) of the values
	var rowConstraintSatisfies = function(choice) {
		return choice.value === this.value && choice.rowIndex === this.rowIndex;
	};
	for(rowIndex = 0; rowIndex < size; rowIndex++) {
		values.forEach(function(value) {
			var constraint = exactcover.createConstraint(rowConstraintSatisfies);
			constraint.name = value + ' must be in row ' + rowIndex;
			constraint.rowIndex = rowIndex;
			constraint.value = value;
			constraints.push(constraint);
		});
	}

	//each column must have one (and only one) of the values
	var columnConstraintSatisfies = function(choice) {
		return choice.value === this.value && choice.columnIndex === this.columnIndex;
	};
	for(columnIndex = 0; columnIndex < size; columnIndex++) {
		values.forEach(function(value) {
			var constraint = exactcover.createConstraint(columnConstraintSatisfies);
			constraint.name = value + ' must be in column ' + columnIndex;
			constraint.columnIndex = columnIndex;
			constraint.value = value;
			constraints.push(constraint);
		});
	}

	//a value must be in every cell
	var cellConstraintSatisfies = function(choice) {
		return this.columnIndex === choice.columnIndex && this.rowIndex === choice.rowIndex;
	};
	for(columnIndex = 0; columnIndex < size; columnIndex++) {
		for(rowIndex = 0; rowIndex < size; rowIndex++) {
			var constraint = exactcover.createConstraint(cellConstraintSatisfies);
			constraint.name = 'value must be in (' + columnIndex + ', ' + rowIndex + ')';
			constraint.rowIndex = rowIndex;
			constraint.columnIndex = columnIndex;
			constraints.push(constraint);
		}
	}

	//each value must be found in the groups
	//this assumes that there are regular
	var groupSize = 3; //TODO: assume that each group is 3x3
	var group1ConstraintSatisfies = function(choice) {
		var rowIndex = choice.rowIndex, 
			columnIndex = choice.columnIndex;
		if(choice.value !== this.value) {
			return false;
		}

		if(rowIndex >= this.groupStartRowIndex && rowIndex < this.groupStartRowIndex + groupSize) {
			if(columnIndex >= this.groupStartColumnIndex && columnIndex < this.groupStartColumnIndex + groupSize) {
				return true;
			}
		}
		return false;
	};
	var groupIndex = 0;
	for(columnIndex = 0; columnIndex < size; columnIndex += groupSize) {
		for(rowIndex = 0; rowIndex < size; rowIndex += groupSize) {
			values.forEach(function(value) {
				var constraint = exactcover.createConstraint(group1ConstraintSatisfies);
				constraint.name = value + ' must be in group ' + groupIndex;
				constraint.groupIndex = groupIndex;
				constraint.groupStartRowIndex = rowIndex;
				constraint.groupStartColumnIndex = columnIndex;
				constraint.value = value;

				constraints.push(constraint);
			});
			groupIndex++;
		}
	}

	return constraints;
}

sudoku.createMatrix = function() {
	var size = 9,

		//create the values
		values = createValues(size),

		//create the choices
		choices = createChoices(size, values),

		//create the constraints
		constraints = createConstraints(size, values);

	var matrix = exactcover.createMatrix(constraints, choices);
	matrix.setValue = function(columnIndex, rowIndex, value) {

		//find the choice corresponding to this value
		var selectedChoice;

		//TODO: fix this to not iterate over every value
		this.choices.forEach(function(choice) {
			if(choice.value === value && choice.rowIndex === rowIndex && choice.columnIndex === columnIndex) {
				selectedChoice = choice;
			}
		});
		
		if(typeof selectedChoice === 'undefined') {
			console.warn('No choice selected');
			return;
		}

		this.selectChoice(selectedChoice);
	};
	return matrix;
};


}).call(this);
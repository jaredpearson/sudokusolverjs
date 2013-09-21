(function(){
"use strict";

/**
 * Creates a matrix for a latin square. 
 *
 * A latin square is a matix of numbers where each number only occurs
 * once in a row and once in a column.
 */
function createLatinSquareMatrix(dimension) {

	function createConstraints(columnSize, rowSize, values) {
		var rowIndex, columnIndex, constraint,
			constraintProto = {},
			constraints = [];

		var cellConstraintSatisfies = function(choice) {
			return this.columnIndex === choice.columnIndex && this.rowIndex === choice.rowIndex;
		};
		var index = 0;

		//a value must be in every cell
		for(columnIndex = 0; columnIndex < columnSize; columnIndex++) {
			for(rowIndex = 0; rowIndex < rowSize; rowIndex++) {
				constraint = Object.create(constraintProto);
				constraint.id = index++;
				constraint.name = 'value must be in (' + columnIndex + ', ' + rowIndex + ')';
				constraint.rowIndex = rowIndex;
				constraint.columnIndex = columnIndex;
				constraint.satisfies = cellConstraintSatisfies;
				constraints.push(constraint);
			}
		}

		var columnConstraintSatisfies = function(choice) {
			return this.value === choice.value && this.columnIndex === choice.columnIndex;
		};

		//each value must be in each column
		for(columnIndex = 0; columnIndex < columnSize; columnIndex++) {
			values.forEach(function(value) {
				constraint = Object.create(constraintProto);
				constraint.id = index++;
				constraint.name = value + ' must be column ' + columnIndex;
				constraint.columnIndex = columnIndex;
				constraint.value = value;
				constraint.satisfies = columnConstraintSatisfies;
				constraints.push(constraint);
			});
		}

		var rowConstraintSatisfies = function(choice) {
			return this.value === choice.value && this.rowIndex === choice.rowIndex;
		};

		//each value must be in each row
		for(rowIndex = 0; rowIndex < rowSize; rowIndex++) {
			values.forEach(function(value) {
				constraint = Object.create(constraintProto);
				constraint.id = index++;
				constraint.name = value + ' must be row ' + rowIndex;
				constraint.rowIndex = rowIndex;
				constraint.value = value;
				constraint.satisfies = rowConstraintSatisfies;
				constraints.push(constraint);
			});
		}
		return constraints;
	};

	function createChoices(columnSize, rowSize, values) {
		var choices = [],
			choiceProto = {},
			index = 0, 
			columnIndex, 
			rowIndex;

		for(columnIndex = 0; columnIndex < columnSize; columnIndex++) {
			for(rowIndex = 0; rowIndex < rowSize; rowIndex++) {
				values.forEach(function(value){
					var choice = Object.create(choiceProto);
					choice.id = String.fromCharCode(97 + index);
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

	var rowSize = dimension, 
		columnSize = dimension,

		//create an array of values [1 .. n]
		values = buildValuesArray(dimension),

		//create all of the constraints for the latin square
		constraints = createConstraints(columnSize, rowSize, values),

		//create all of the choices for the latin square
		choices = createChoices(columnSize, rowSize, values);

	return createMatrix(constraints, choices);
}

/**
 * Creates a new matrix from the given constraints and choices.
 */
function createMatrix(constraints, choices) {

	/**
	 * traverses a circular linked list starting with this node using the
	 * given property. the f callback is invoked for each visit
	 */
	var forEach = function(property, f) {
		var node = this, index = 0;
		do {
			f(node, index, this);
			node = node[property];
			index++;
		} while(node !== this);
	};

	/**
	 * inserts a new node before this node within the given circular linked list.
	 */
	var insertNode = function(nextProperty, prevProperty, node) {
		node[prevProperty] = this;
		node[nextProperty] = this[nextProperty];
		this[nextProperty][prevProperty] = node;
		this[nextProperty] = node;
	};

	//prototype object for all nodes
	var nodeProto = {
		setUp: function(node) {
			insertNode.call(this, 'up', 'down', node);
		},
		setDown: function(node) {
			insertNode.call(this, 'down', 'up', node);
		},
		setLeft: function(node) {
			insertNode.call(this, 'left', 'right', node);
		},
		setRight: function(node) {
			insertNode.call(this, 'right', 'left', node);
		},
		forEachLeft: function(f) {
			forEach.call(this, 'left', f);
		},
		forEachRight: function(f) {
			forEach.call(this, 'right', f);
		},
		forEachUp: function(f) {
			forEach.call(this, 'up', f);
		},
		forEachDown: function(f) {
			forEach.call(this, 'down', f);
		}
	};

	//factory method to create new nodes
	var createNode = function() {
		var node = Object.create(nodeProto);
		node.up = node.down = node.left = node.right = node;
		return node;
	};

	var firstColumnHeader, 
		lastColumnHeader, 
		index = 0, 
		lastChoice = {};

	constraints.forEach(function(constraint){
		var columnHeader = createNode(),
			lastNode = columnHeader;
		columnHeader.header = true;
		columnHeader.nodeCount = 0;
		columnHeader.constraint = constraint;
		columnHeader.columnHeader = columnHeader;

		//set the root column header
		if(!firstColumnHeader) {
			firstColumnHeader = columnHeader;
		}

		//link the new header to the last header
		if(lastColumnHeader) {
			lastColumnHeader.setRight(columnHeader);
		}

		choices.forEach(function(choice){

			//if the choice doesn't satisfy the constraint, then no need to add a node
			if(!constraint.satisfies(choice)) {
				return;
			};

			//create the new node
			var node = createNode();
			node.id = 'n' + index;
			node.constraint = constraint;
			node.choice = choice;
			node.columnHeader = columnHeader;

			//update the column header
			columnHeader.nodeCount++;

			//update the last node
			lastNode.setDown(node);

			if(lastChoice[choice.id]) {
				lastChoice[choice.id].setRight(node);
			}
			lastChoice[choice.id] = node;

			lastNode = node;
			index++;
		});

		lastColumnHeader = columnHeader;
	});

	//create the matrix
	var matrix = createNode();
	matrix.header = true;
	matrix.print = function() {
		this.forEachRight(function(columnHeader) {
			columnHeader.forEachDown(function(node) {
				if(node.header) {
					return;
				}
				console.log(node.id + ': ' + node.constraint.id + ' * ' + node.choice.id);
			});
		});
	};
	matrix.isEmpty = function() {
		return this.right === this;
	};

	lastColumnHeader.setRight(matrix);
	return matrix;
}

function cover(node) {
	var columnHeader = node.columnHeader;

	//remove the column from the headers
	columnHeader.right.left = columnHeader.left;
	columnHeader.left.right = columnHeader.right;

	//remove the related cells from the matrix
	columnHeader.forEachDown(function(downNode){
		if(downNode === columnHeader) {
			return;
		}

		downNode.forEachRight(function(rightNode){
			if(rightNode === downNode) {
				return;
			}

			rightNode.up.down = rightNode.down;
			rightNode.down.up = rightNode.up;

			//adjust the column header count
			rightNode.columnHeader.nodeCount--;
		});
	});
};

function uncover(node) {
	var columnHeader = node.columnHeader;

	//add the related cells back to the matrix
	columnHeader.forEachUp(function(upNode){
		if(upNode === columnHeader) {
			return;
		}

		upNode.forEachLeft(function(leftNode){
			if(leftNode === upNode) {
				return;
			}

			leftNode.up.down = leftNode;
			leftNode.down.up = leftNode;

			//adjust the column header count
			leftNode.columnHeader.nodeCount++;
		});
	});

	//add the column back to the headers
	columnHeader.right.left = columnHeader;
	columnHeader.left.right = columnHeader;
};

//find the column with the greatest number of nodes
function findColumnWithGreatestNumberOfNodes(matrix) { 
	var greatestColumn;
	matrix.forEachRight(function(column) {
		if(column === matrix) {
			return;
		}

		if(!greatestColumn || column.nodeCount > greatestColumn.nodeCount) {
			greatestColumn = column;
		}
	});
	return greatestColumn;
}

//find a column with the lowest number of nodes
function findColumnWithLowestNumberOfNodes(matrix) {
	var lowestColumn;
	matrix.forEachRight(function(column){
		if(column == matrix) {
			return;
		}

		if(!lowestColumn || column.nodeCount < lowestColumn.nodeCount) {
			lowestColumn = column;
		} 
	});
	return lowestColumn;
}


function solve(matrix) { 
	//stores all of the solutions found by _solve
	var allSolutions = [];

	//this function is recursively called to try and find solutions
	function _solve(matrix, solution) {
		if(!solution) {
			solution = [];
		}

		//if all of the nodes are gone from the matrix, then we
		//can print the solution and return
		if(matrix.isEmpty()) {
			allSolutions.push(solution.slice());
			return;
		}

		//choose a column with the lowest number of choices
		var chosenColumn = findColumnWithLowestNumberOfNodes(matrix);

		//cover the column
		cover(chosenColumn);

		chosenColumn.forEachDown(function(columnNode) {

			//skip the column header
			if(chosenColumn === columnNode) {
				return;
			}

			//set the choice as a possible solution
			solution.push(columnNode);

			//when we selected this choice, all other constraints
			//corresponding to the choice are fulfilled. let's remove
			//the other choices from the matrix
			columnNode.forEachRight(function(rightNode) {

				//skip the columnNode
				if(columnNode === rightNode) {
					return;
				}

				cover(rightNode);
			});

			//try to solve the smaller matrix
			_solve(matrix, solution);

			solution.pop();

			columnNode.forEachLeft(function(leftNode) {
				if(columnNode === leftNode) {
					return;
				}

				uncover(leftNode);
			});
		});

		uncover(chosenColumn);
	};

	//start solving
	_solve(matrix);

	return allSolutions;
}

var matrix = createLatinSquareMatrix(2);

var solutions = solve(matrix);
solutions.forEach(function(solution) {
	console.log('solution found: ');
	solution.forEach(function(node) {
		console.log('\t' + node.choice.name);
	});
});

}).call(this);
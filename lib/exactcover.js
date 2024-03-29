(function() {
"use strict";

//setup module/exports
var exactcover;
if(typeof exports !== 'undefined') {
	exactcover = exports;
} else {
	exactcover = this.exactcover = {};
}

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


/**
 * Generates a unique ID with the given prefix
 * @param prefix
 */
var generateId = (function() {
	var _idIndex = 0;
	return function(prefix) {
		return (typeof prefix !== 'undefined' ? prefix : '') + (_idIndex++);
	};
}).call(this);

/**
 * prototype object for all nodes
 */ 
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

/**
 * Creates a new choice
 */
exactcover.createChoice = function() {
	return {
		id: generateId('choice_')
	};
};

/**
 * finds the first node corresponding to the choice
 */
function findChoiceNode(matrix, choice) {
	var choiceNode;
	matrix.forEachRight(function(right) {
		if(matrix === right) {
			return;
		}

		right.forEachDown(function(downNode) {

			//TODO: fix this so that we can break from the for loop
			if(typeof choiceNode !== 'undefined') {
				return;
			}

			if(downNode.choice === choice) {
				choiceNode = downNode;
			}
		});	
	});
	return choiceNode;
}

/**
 * prototype object for a contraint.
 */
var constraintProto = {
	satisfies: function(choice) {
		return false;
	}
};

/**
 * Creates a new constraint
 * @param satisfies Optional function to set whether this constraint is 
 * satisfied by a given choice. If not specified, then a function is always used.
 */
exactcover.createConstraint = function(satisfies) {
	var constraint = Object.create(constraintProto);
	constraint.id = generateId('constraint_');
	if(satisfies) {
		constraint.satisfies = satisfies;
	}
	return constraint;
};

/**
 * Creates a new matrix from the given constraints and choices.
 */
exactcover.createMatrix = function(constraints, choices) {

	var firstColumnHeader, 
		lastColumnHeader, 
		index = 0, 
		lastChoice = {};

	//build out the nodes 
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
			}

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
				console.log(node.id + ': ' + node.constraint.id + '(' + node.constraint.name + ') * ' + node.choice.id + '(' + node.choice.name + ')');
			});
		});
	};
	matrix.isEmpty = function() {
		if(this.right === this) {
			return true;
		}

		//if there is at least a column with a nodeCount higher than 0, then
		//the matrix is not empty
		var node = this.right;
		while(node !== this) {
			if(node.nodeCount > 0) {
				return false;
			}

			node = node.right;
		}

		return true;
	};
	matrix.choices = choices.slice();
	matrix.constraints = constraints.slice();
	matrix.selectedChoices = [];
	matrix.selectChoice = function(choice) {
		var choiceNode = findChoiceNode(matrix, choice);
		if(typeof choiceNode === 'undefined') {
			console.warn('No choice node found');
			return false;
		}

		//save all of the selected choices
		matrix.selectedChoices.push(choice);

		//when we select this choice, all other constraints
		//corresponding to the choice are fulfilled. let's remove
		//the other choices from the matrix
		choiceNode.forEachRight(function(rightNode) {
			cover(rightNode);
		});

		return true;
	};

	lastColumnHeader.setRight(matrix);
	return matrix;
};

/**
 * Hides the column of the given node so that it cannot be seen through
 * normal traversal. Use the uncover method to restore the column.
 */
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
}

/**
 * Restores the column of the given node back in the matrix after
 * the cover operation is performed.
 */
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
}

//find a column with the lowest number of nodes
function findColumnWithLowestNumberOfNodes(matrix) {
	var lowestColumn;
	matrix.forEachRight(function(column){
		if(column == matrix) {
			return;
		}
		if(column.nodeCount === 0) {
			return;
		}

		if(!lowestColumn || column.nodeCount < lowestColumn.nodeCount) {
			lowestColumn = column;
		} 
	});
	return lowestColumn;
}

/**
 * this function is recursively called to try and find solutions. the entry 
 * point is found within the solve method
 */
function _solve(maxSolutions, allSolutions, matrix, solution) {
	if(!solution) {
		solution = [];
	}

	//if all of the nodes are gone from the matrix, then we
	//can print the solution and return
	if(matrix.isEmpty()) {
		allSolutions.push(solution.slice());
		return (allSolutions.length === maxSolutions) ? 1 : 0;
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
		solution.push(columnNode.choice);

		//when we selected this choice, all other constraints
		//corresponding to the choice are fulfilled. let's remove
		//the other choices from the matrix
		columnNode.forEachRight(function(rightNode) {
			cover(rightNode);
		});

		//try to solve the smaller matrix
		if(_solve(maxSolutions, allSolutions, matrix, solution) === 1) {
			return;
		}

		solution.pop();

		columnNode.forEachLeft(function(leftNode) {
			uncover(leftNode);
		});
	});

	uncover(chosenColumn);
}

/** 
 * Returns all of the solutions to solve the exact cover problem.
 */
exactcover.solve = function(matrix) { 
	//stores all of the solutions found by _solve
	var allSolutions = [];

	//start solving
	_solve(10, allSolutions, matrix);

	return allSolutions;
};

}).call(this);

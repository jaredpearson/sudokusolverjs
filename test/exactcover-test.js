
var exactcover = require('../lib/exactcover'),
	assert = require('assert');

suite('exactcover', function() {
	var createTestChoices = function(number) {
			var choices = [],
				i = 0;
			for(; i < number; i++) {
				choices.push(exactcover.createChoice());
			}
			return choices;
		},
		createTestConstraints = function(number, /* Function* */ satisfies) {
			var constraints = [],
				i = 0,
				defaultSatisfies = function() {
					return true;
				};
			for(; i < number; i++) {
				constraints.push(exactcover.createConstraint(satisfies || defaultSatisfies));
			}
			return constraints;
		},
		countRowNodes = function(matrix) {
			var count = 0, //1 for the first node
				node = matrix;
			do {
				count++;
				node = node.right;
			} while(node != matrix);
			return count;
		},
		countColumnNodes = function(headerNode) {
			var count = 0,
				node = headerNode.down; //skip the root node
			do {
				count++;
				node = node.down;
			} while(node != headerNode);
			return count;
		};

	suite('#createConstraint', function() {

		test('should always return a value', function() {
			var constraint = exactcover.createConstraint();
			assert(constraint, 'expected createConstraint to never return null');
		});

		test('should have an id', function() {
			var constraint = exactcover.createConstraint();
			assert(constraint.id, 'expected constraint to always have an id');
		});

		test('should use satisfies specified in ctor', function() {
			var mockChoice = {};
			var mockSatisfies = function(choice) {
				mockSatisfies._args = arguments;
				return true;
			};
			var constraint = exactcover.createConstraint(mockSatisfies);
			var returnValue = constraint.satisfies(mockChoice);
			assert(returnValue);
			assert.strictEqual(mockSatisfies._args.length, 1);
			assert.strictEqual(mockSatisfies._args[0], mockChoice);
		});	

	});

	suite('#createChoice', function() {

		test('should always return a value', function() {
			var choice = exactcover.createChoice();
			assert(choice, 'expected createChoice to never return null');
		});

		test('should have an id', function() {
			var choice = exactcover.createChoice();
			assert(choice.id, 'expected choice to always have an id');
		});

	});

	suite('#createMatrix', function() {

		test('should always return a value', function() {
			var rowCount = -1, 
				choices = createTestChoices(2),
				constraints = createTestConstraints(2),
				matrix = exactcover.createMatrix(constraints, choices);
			assert(matrix);
		});

	});

	suite('Matrix', function() {

		test('should always have one root node and column header nodes', function() {
			var choices = createTestChoices(2),
				constraints = createTestConstraints(2),
				matrix = exactcover.createMatrix(constraints, choices),
				rowCount = countRowNodes(matrix);
			assert.strictEqual(rowCount, 3, 'expected there to be 3 nodes: 1 root node + a header node for each constraint');
		});

		test('should return a root node with no up or down nodes', function() {
			var choices = createTestChoices(2),
				constraints = createTestConstraints(2),
				matrix = exactcover.createMatrix(constraints, choices);

			//check the up/down properties of root node
			assert.strictEqual(matrix, matrix.up, 'the matrix should not contain any other up node');
			assert.strictEqual(matrix, matrix.down, 'the matrix should not contain any other down node');
		});

		test('should return a matrix with a node for each choice', function() {
			var choices = createTestChoices(2),
				constraints = createTestConstraints(2),
				matrix = exactcover.createMatrix(constraints, choices),
				node = matrix.right, //skip the root node
				columnCounts = []; 
			do {
				columnCounts.push(countColumnNodes(node));
				node = node.right;
			} while(node != matrix);
			assert.strictEqual(columnCounts.length, 2);
			assert.strictEqual(columnCounts[0], 2, 'expected the first column to have two choice nodes');
			assert.strictEqual(columnCounts[1], 2, 'expected the second column to have two choice nodes');
		});

		test('should always have header property', function() {
			var choices = createTestChoices(2),
				constraints = createTestConstraints(2),
				matrix = exactcover.createMatrix(constraints, choices);

			assert.strictEqual(matrix.header, true, 'expected matrix to always have a header property');
		});
		
	});
	
});

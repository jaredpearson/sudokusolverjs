
TESTS = test/*.js
LIB = lib/*.js

all: lint test

install:
	npm install

test:
	@NODE_ENV=test ./node_modules/.bin/mocha -u tdd $(TESTS)

lint:
	@NODE_ENV=lint ./node_modules/.bin/jshint $(TESTS) $(LIB)

clean:
	rm -rf node_modules

.PHONY: all install test lint clean


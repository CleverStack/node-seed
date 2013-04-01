# Solved Problems

## Javascript/CSS smashing. (StealJS recommended by Richard)

	To do a production build,
		1. cd public
		2. (Windows) steal\js.bat scripts/build.js or (Nix) steal\js scripts/build.js
		3. (TODO) Grunt build support for CI and CLI

## Environment-specific configuration mechanisms
	
	NCONF Configuration Files:
	
	config/global.json is where you put all your defaults/global stuff
	config/NODE_ENV.json is also loaded and recursively merged with global (where NODE_ENV is one of 'local', 'dev', 'stag' or 'prod')

	You should set your NODE_ENV environment variable (but on your local machine you shouldn't need to, it will default to use config/local.json)


# Problems we need to solve and/or demonstrate solutions for:

## Examples of several types of data storage calls
	1. Postgres (MySQL as well?), NoSQL, Redis
	2. Transaction example




## Demonstration of the important of modularizing data calls into service layer objects.

	Example of dependency injection.
	I've tried to make the controllers and services all use
	this principle, but it's probably the most important thing
	to me, so I keep beating this horse.


## Production Deployment Mechanism

	Need multiple instances and a means of not losing session information if one instance dies.
	
	1. Brian recommended Redis, (+1 from richard for redis)
	2. I saw a neat demo on gossip protocol and streaming that looked fun.
	
	Redis sounds easier and more straightforward.


## Continuous integration

	grunt + jasmine-node is what I usually use but there's lots of options here
	Richard: (Grunt will work well as StealJS has a plugin for building the JS)

## End-to-end testing

	Brian Carlson mentioned a cool automated REST tester using something like CuRL


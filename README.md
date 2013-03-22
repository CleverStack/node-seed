# Problems we need to solve and/or demonstrate solutions for:


## Javascript/CSS smashing. (StealJS recommended by Richard)


## Examples of several types of data storage calls
	1. Postgres, NoSQL, Redis
	2. Transaction example


## Environment-specific configuration mechanisms
	
	I have a simple config array merger in place. But it's
	something I just jammed into an existing site. If somebody
	wants something more sophisticated, speak up.


## Demonstration of the important of modularizing data calls into service layer objects.

	Example of dependency injection.
	I've tried to make the controllers and services all use
	this principle, but it's probably the most important thing
	to me, so I keep beating this horse.


## Production Deployment Mechanism

	Need multiple instances and a means of not losing session information if one instance dies.
	
	1. Brian recommended Redis,
	2. I saw a neat demo on gossip protocol and streaming that looked fun.
	
	Redis sounds easier and more straightforward.


## Continuous integration

	grunt + jasmine-node is what I usually use but there's lots of options here

## End-to-end testing

	Brian Carlson mentioned a cool automated REST tester using something like CuRL


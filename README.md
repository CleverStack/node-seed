This seed app is meant to be a base for node.js apps.

It's got many examples and we encourage you to send suggestions.

# Installation

## SequelizeJS
We use sequelizejs as our default ORM layer (For now), for more information please see http://www.sequelizejs.com/

## Database
Run `node bin/rebase` to setup your database and Run `node bin/seedModels` to setup seed data in those model

TODO

# Examples/Explanations

## Controller

clever-controller npm module

## Environment-specific configuration mechanisms

```	
NCONF Configuration Files:
	
config/global.json is where you put all your defaults/global stuff (for production)
config/NODE_ENV.json is also loaded and recursively merged with global (where NODE_ENV is one of 'local', 'dev', 'stag' or 'prod')
```

You should set your NODE_ENV environment variable (but on your local machine you shouldn't need to, it will default to use config/local.json)
Also, note local.json is ignored, but you have a sample in local.example.json

```
1. Postgres & MySQL, MongoDB
2. Hybrid models that can run SQL and NoSQL side by side
3. Transaction example
```

## Demonstration of the important of modularizing data calls into service layer objects.
## Production Deployment Mechanism
## Continuous integration
## End-to-end testing

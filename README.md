# CleverStack NodeJS Seed

## Setup

1. Clone the repo
2. `git submodule init` and `git submodule update`
6. create and configure `config/local.json`
3. `npm i`
4. `node bin/rebase.js`
5. `node bin/seedModels.js`
7. `nodemon` (if you have `nodemon`) otherwise just `node app`

## SequelizeJS
We use sequelizejs as our default ORM layer, for more information please see http://www.sequelizejs.com/ and we use Mongoose as our ODM.

## Database
Run `node bin/rebase` to setup your database and Run `node bin/seedModels` to setup seed data in those model

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

## Service Layer
## Production Deployment Mechanism
## Continuous integration
## End-to-end (integration) testing
## Unit testing

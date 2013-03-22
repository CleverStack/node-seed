PORT_WWW=$1
ENV_NAME=$2
APP_PATH=$PWD

if [ $PORT_WWW ]
    then export NODE_WWW_PORT=$PORT_WWW;
fi

if [ $ENV_NAME ]
	then export NODE_ENV=$ENV_NAME
fi

nodemon --debug "$PWD/app.js"
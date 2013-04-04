angular.module('stub.Services',['http-auth-interceptor','ngResource'])
	.factory('LoginService', LoginServiceFactory)
	.factory('UserService', UserServiceFactory);



/**
 * Login Service
 */

function LoginServiceFactory($http) {

	return {

		login: function(params) {
			return $http.post('user/login', params);
		},

		logout: function() {
			return $http.get('user/logout');
		}

	};	

}

LoginServiceFactory.$inject = ['$http'];




/**
 * User Service. Just using it as an example of
 * some protected data
 */

function UserServiceFactory($resource) {
	
	// REST url
	var url = 'user/:userId';

	// url parameter defaults
	var defaults = {};

	// methods on the service
	var actions = {
		query: {
			method: 'GET', 
			params: {}, 
			isArray: true
		}, 
        getSource: {
            method: 'GET',
            params: {},
            isArray: true
        },
        update: {
            method: 'PUT',
            params: {userId:'@id'}
        },
        destroy: { 
            method: 'DELETE',
            params: {userId:'@id'}
        }

	};

	// build singleton and return
	return $resource(url, defaults, actions);

}

UserServiceFactory.$inject = ['$resource'];






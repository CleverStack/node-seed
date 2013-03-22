/**
 * Super-basic angular configuration.
 * 
 * As this project grows we will undoubtedly want to separate
 * services, routes, directives into child modules.
 */

angular.module('stub', ['stub.Directives', 'stub.Services', 'http-auth-interceptor', 'ui', 'ngResource'])
	.config(RouteConfiguration);


/**
 * Route Config
 */

function RouteConfiguration($routeProvider) {

	var views = 'partials/';

	$routeProvider
		.when('/', {
			templateUrl: views + 'home.html'
		})
		.when('/users', {
			templateUrl: views + 'users.html',
			controller: UserCtrl
		})
		.when('/error', {
			templateUrl: views + 'error.html'
		})
		.otherwise({
			redirectTo: '/error'
		});

}

RouteConfiguration.$inject = ['$routeProvider'];




/**
 * Login Controller
 */

function LoginCtrl($scope, authService, LoginService) {
		
	console.log('login control');

	$scope.template = {
		popup: 'partials/login.html'
	};

	// I made this query require a login
	// by protecting it on the server.	
	
	$scope.credentials = {
		username: null,
		password: null
	};

	$scope.showWarning = false;

	// The auth interceptor makes these two events fire.
	// You can pick them up anywhere because they fire
	// on $rootScope. I just put these handlers in here
	// as an example, but it's more likely you'll want
	// to make a login box show or hide itself when
	// these events fire.
	
	$scope.$on('event:auth-loginRequired', function() {
		console.info('login required event fired');
		$('#loginModal').modal('show');
	});

	$scope.$on('event:auth-loginConfirmed', function() {
		$('#loginModal').modal('hide');
		console.info('login complete event fired');
	});

	// Manage login screen
	// popup? dialog box?
	$scope.doLogin = function() {

		LoginService.login($scope.credentials)
			.success(function() {
				$scope.showWarning = false;
				authService.loginConfirmed();
			}).error(function() {
				$scope.showWarning = true;
				console.error('Failed login');
			});

	};
	
}

LoginCtrl.$inject = ['$scope', 'authService', 'LoginService'];



/**
 * SecretCtrl, This is just a page that asks for some
 * data which is protected by authentication 
 */

function UserCtrl($scope, UserService) {
	$scope.users = UserService.query();
}

UserCtrl.$inject = ['$scope', 'UserService'];


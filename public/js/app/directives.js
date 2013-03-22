var directives = angular.module('stub.Directives',['http-auth-interceptor']);

directives.directive('ngBlur', function() {
	return function( scope, elem, attrs ) {
		elem.bind('blur', function() {
			scope.$apply(attrs.ngBlur);
		});
	};
});

directives.directive('ngConfirm', function($window) {
	return function( scope, elem, attrs ) {
		elem.bind('click', function() {
			return $window.confirm(attrs['ngConfirm']);
		});
	};
});

directives.directive('modal', function() {
	return {
		link: function(scope, elm, attr){
			scope.$on('event:auth-loginRequired', function() {
				console.info('login required event fired');
				$('#loginModal').modal('show');
			});

			scope.$on('event:auth-loginConfirmed', function() {
				$('#loginModal').modal('hide');
				console.info('login complete event fired');
			});
		}
	};
});


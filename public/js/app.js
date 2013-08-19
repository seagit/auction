'use strict';


// Declare app level module which depends on filters, and services
angular.module('vsenavseApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers', 'myApp.factories', 'ngResource'])
	.config(['$routeProvider', function($routeProvider) {
	
	}])
	.run(function() {
		console.log('vse na vse app initing !')
	});
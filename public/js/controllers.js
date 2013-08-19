'use strict';

/* Controllers */

angular.module('myApp.controllers', ['ngResource'])
  .controller('indexCtrl', ['$scope', function($scope) {
		$scope.lots = [{
			title: 'Пуловер ангоровый апельсиновый',
			img: '/i/lots/index_demo1.jpg',
			gift: true
		},
		{
			title: 'Плеєр дисковий',
			img: '/i/lots/index_demo3.jpg'
		},
		{
			title: 'Телефон iPhone 5S',
			img: '/i/lots/index_demo4.jpg'
		},
		{
			title: 'Куртка на ваті',
			img: '/i/lots/index_demo2.jpg'
		},
		{
			title: 'Платье бежевое',
			img: '/i/lots/index_demo6.jpg'
		},
		{
			title: 'Плеєр дисковий',
			img: '/i/lots/index_demo2.jpg',
			closeHome: true
		},
		{
			title: 'Телефон iPhone 5S',
			img: '/i/lots/index_demo5.jpg'
		},
		{
			title: 'Куртка на ваті',
			img: '/i/lots/index_demo4.jpg',
			closeHome: true
		},
		{
			title: 'Платье бежевое',
			img: '/i/lots/index_demo3.jpg'
		},
		{
			title: 'Плеєр дисковий',
			img: '/i/lots/index_demo5.jpg',
			gift: true
		},
		{
			title: 'Телефон iPhone 5S',
			img: '/i/lots/index_demo2.jpg',
			gift: true
		},
		{
			title: 'Куртка на ваті',
			img: '/i/lots/index_demo4.jpg'
		}];
		$scope.exchanges = [{
			lot1: {
				title: 'Сумка блестит на плече',
				img: '/i/lots/exchange_demo1.jpg'
			},
			lot2: {
				title: 'Куртка на ваті',
				img: '/i/lots/exchange_demo3.jpg'
			}
		},{
			lot1: {
				title: 'Плеєр дисковий',
				img: '/i/lots/exchange_demo2.jpg'
			},
			lot2: {
				title: 'Куртка на ваті',
				img: '/i/lots/exchange_demo6.jpg'
			}
		},{
			lot1: {
				title: 'Плеєр дисковий',
				img: '/i/lots/exchange_demo4.jpg'
			},
			lot2: {
				title: 'Куртка на ваті',
				img: '/i/lots/exchange_demo1.jpg'
			}
		},{
			lot1: {
				title: 'Плеєр дисковий',
				img: '/i/lots/exchange_demo2.jpg'
			},
			lot2: {
				title: 'Куртка на ваті',
				img: '/i/lots/exchange_demo5.jpg'
			}
		},{
			lot1: {
				title: 'Плеєр дисковий',
				img: '/i/lots/exchange_demo6.jpg'
			},
			lot2: {
				title: 'Куртка на ваті',
				img: '/i/lots/exchange_demo2.jpg'
			}
		},{
			lot1: {
				title: 'Плеєр дисковий',
				img: '/i/lots/exchange_demo4.jpg'
			},
			lot2: {
				title: 'Куртка на ваті',
				img: '/i/lots/exchange_demo3.jpg'
			}
		}];
	}])
	.controller('footerCtrl', ['$scope', function($scope) {
		$scope.news = [{
			date: '15 липня 2013',
			title: 'Новий інтернет магазин',
			text: 'Дозволяє користувачам сформувати замовлення, вибрати спосіб оплати'
		},{
			date: '8 березня 2012',
			title: 'Нові можливості',
			text: 'Сформувати замовлення, вибрати спосіб оплати дозволяє користувачам '
		}];
}]);
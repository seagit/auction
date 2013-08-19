'use strict';

/* Directives */


angular.module('myApp.directives', []).
	directive('mainSearch', function(version) {
		var categories = ['Книги', 'Комп`ютери', 'Телефони, смартфони', 'Техника, електроніка', 'Мода, краса', 'Диски', 'Все для дому', 'Для дітей', 'Дозвілля, відпочинок', 'Колекціонування', 'Авто, мото', 'Різне'];
		var selected = '';
		return {
			restrict: 'A',
			controller: function($scope, $element) {
				$scope.categorySelected = function(e) {
					var cCategory = $(e.target);
					$scope.selected = cCategory.text();
					console.log(selected);
				};
			},
			link: function(scope, elem, attrs) {
				var searchField = $('.search-input', elem);
				var categoriesTrigger = $('.categories-choice-trigger', elem);
				var categoriesContainer = $('.categories-choice', elem);

				categoriesContainer.hide();
				scope.categories = categories;

				categoriesTrigger.bind('click', function() {
					categoriesContainer.slideToggle();
				});
				categoriesContainer.bind('click', function() {
					setTimeout(function() {
						categoriesContainer.fadeOut();
					}, 1);
				})
				scope.$watch('selected', function(newVal, oldVal) {
					categoriesTrigger.text(scope.selected);
				}, true);
			}
		};
	}).
	directive('appVersion', ['version', function(version) {
	return function(scope, elm, attrs) {
		elm.text(version);
	};
	}])/*.
  directive('ddMenu', function($document) {
	return {
		link: function linkFn($scope, lElem, attrs) {
			var mBlock = angular.element(lElem.children()[2]);
			var closeMenu = function() {
				mBlock.removeClass('dd-opened');
				mBlock.addClass('dd-closed');
				lElem.removeClass('dd-opened');
				lElem.addClass('dd-closed');
				$document.unbind('click', closeMenu);
			};
			var openMenu = function() {
				mBlock.removeClass('dd-closed');
				mBlock.addClass('dd-opened');
				lElem.removeClass('dd-closed');
				lElem.addClass('dd-opened');
			};
			angular.element(lElem.children()[1]).bind('click', function(e) {
				if(mBlock.hasClass('dd-opened')) {
					closeMenu();
					e.stopPropagation();
				} else {
					$document.bind('click', closeMenu);
					openMenu();
					e.stopPropagation();
				}
			});
		}
	};
  }).
  directive('popoverMenu', function($parse) {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			var poTrigger = $(elem);
			var poContainer = poTrigger.next('.popover');
			elem.bind('click', function() {
				var poTriggerPos = poTrigger.position();
				var poTriggerWidth =  poTrigger.outerWidth();
				var poTriggerHeight =  poTrigger.outerHeight();
				var poContainerWidth =  poContainer.outerWidth();
				var leftPoContainer = poTriggerPos.left - poContainerWidth/2 + poTriggerWidth/2;
				var topPoContainer = poTriggerPos.top + poTriggerHeight;
				poContainer.css({
					'top': topPoContainer + 'px',
					'left': leftPoContainer + 'px'
				});
				poContainer.fadeToggle();
			});
			if(attrs.poclose == 'click') {
				poContainer.bind('click', function() {
					setTimeout(function() {
						poContainer.fadeOut();
					}, 1);
				});
			}
		}
	};
  }).
  directive('openInvites', function() {
	return {
		restrict: 'A',
		template: '<div ng-repeat="invite in oInvites" ng-click="inviteClicked($event, $index)" class="invite-item">' +
						'{{invite.screenName}} ({{invite.email}})' +
					'</div>',
		scope: {
			oInvites: '=',
			sInvites: '='
		},
		controller: function($scope, $element) {
			$scope.inviteClicked = function(e, index) {
				var oiElem = $(e.target);
				var oiEmail = $scope.oInvites[ index ];
				oiElem.toggleClass('invite-checked');
				var ind = $scope.sInvites.indexOf( oiEmail )
				if(ind === -1) {
					$scope.sInvites.push( oiEmail );
				} else {
					$scope.sInvites.splice( ind, 1 );
				}
				console.log(oiElem);
			}
		},
		link: function(scope, elem, iAttrs) {
			scope.$watch('sInvites', function(newVal, oldVal) {
				if(newVal.length === 0) {
					$('.invite-item', elem).removeClass('invite-checked');
				}
			}, true);
		}
	};
  }).
  directive('adminUserItems', function() {
	return {
		restrict: 'A',
		templateUrl: '/partials/adminusers.html',
		link: function(scope, elem, attrs) {
			scope.makeAdmin = function(user, ind, e) {
				console.log('uSER', user);
				console.log('eVENT', e);
			};
			scope.revokeUser = function(user, ind, e) {
				console.log('uSER', user);
				console.log('eVENT', e);
			};
			scope.removeUser = function(user, ind, e) {
				console.log('uSER', user);
				console.log('eVENT', e);
			};
		}
	};
  }).
  directive('expandableFooter', function() {
	return {
		restrict: 'A',
		templateUrl: '/partials/footerstatic.html',
		link: function(scope, elem, attrs) {
			var exClosedTrigger = $('.footer-trigger-closed', elem);
			var exOpenedTrigger = $('.footer-trigger-opened', elem);
			var exContainer = $('.footer-container-wrapper', elem);
			exOpenedTrigger.hide();
			exContainer.hide();

			exClosedTrigger.bind('click', function() {
				exClosedTrigger.hide();
				exOpenedTrigger.fadeIn();
				exContainer.slideDown();
				var offs = exContainer.offset().top;
				setTimeout( function() {
					$('html, body').animate({
						scrollTop: offs
					}, 1000);
				}, 1);
				exContainer.find('.footer-container').css('opacity', 1);
			});
			exOpenedTrigger.bind('click', function() {
				exOpenedTrigger.hide();
				exClosedTrigger.fadeIn();
				exContainer.slideUp();
				exContainer.find('.footer-container').css('opacity', 0);
			});
		}
	};
  }).
  directive('scrollFooter', function() {
	return {
		restrict: 'A',
		templateUrl: '/partials/footerscroll.html',
		link: function(scope, elem, attrs) {
			var goupTrigger = $('.footer-goup-link', elem);
			goupTrigger.bind('click', function() {
				$('html, body').animate({
					scrollTop: 0
				}, 300);
			});
			var qField = $('#q', elem);
			qField.bind("keydown", function(e) {
                if(e.which === 13) {
                    if(qField.val() != '') {
						console.log(qField.val());
						alert('search is disabled for now.');
                    }
                    e.preventDefault();
                }
            });
		}
	};
  })*/;

$(document).ready(function(){
	/*var Vguser = Backbone.Model.extend({
		url: function() {
			return '/users/' + this.get('id') + '.json';
		}
	});

	var LoginStatusV = LoginStatusV = Backbone.View.extend({
		el: '#lgi-lgo',
		model: null,
		loggedIn: false,
		template_login: _.template($('#login-head').html()),
		template_logout: _.template($('#logout-head').html()),
		initialize: function() {
			this.loggedIn = ($("#cuid").length > 0);      // ? delete hidden input with uid ?
			if(this.loggedIn) {
				this.model = new Vguser({ id: $("#cuid").val()});
				this.model.fetch({ success:$.proxy(function() {
					this.render();
				}, this) });
			} else {
				this.render();
			}
		},
		render: function() {
			if(this.loggedIn) {
				this.$el.hide().html(this.template_logout(this.model.attributes)).fadeIn();
			} else {
				this.$el.hide().html(this.template_login()).fadeIn();
			}
		}
	});
	var lgview = new LoginStatusV();

	$('#loginForm').modal();

	//Now this code is not used because we redirect in app.get('logout')
    $('#logout-trigger').live('click', function() {
        $.ajax({
            url: '/logout',	// '/login'
            type: 'GET',	// 'DEL' , commented in index.js
            success: function(data){
	            if(data.status == 'OK') {
		            lgview.loggedIn = false;
		            $("#cuid").remove();
	                lgview.render();
	            } else {
		            console.warn(data.msg + '!');
	            }
            }
        });
    });

	$('#lg-form').ajaxForm( function(data) {
		if(data.status == 'OK') {
			lgview.model = new Vguser({ id: data.uid});
			lgview.model.fetch({ success: function() {
				lgview.loggedIn = true;
				lgview.render();
			} });

			$('#loginForm').modal('hide');
		} else {
			$('.err-lg').fadeIn().html(data.msg).delay(5000).fadeOut();
		}

	})

	$('#search-main').ajaxForm( function(data) {
		if(data.status && data.status == 'ERR') {
			//nothing found
		} else {
			var a = data;
			var t = _.template($('#lot-item').html());
			var search_results_html = _.reduce(data, function(a, el) {
				return a + t({lot: el});
			}, '');
			$('.search-results').html(search_results_html);
		}

	})
	
	
	
	

	if($('#has-to-be-logged-in').val() == 'yes') {
		$('#loginForm').modal('show');
	}

	$("#ex-prod").carouFredSel({
		items: {
			visible: 6,
			width: 156,
			height: 150
		},
		scroll: 1,
		auto: false,
		prev: {
			button: "#prev-carousel",
			key: "left"
		},
		next: {
			button: "#next-carousel",
			key: "right"
		},
		pagination: "#pagin-cont"
	});

	if($('#user-page .lot-desc').length == 1) {
		CKEDITOR.replace('item[description]');
		CKEDITOR.replace('item[wish]');
	}

	function openNewLotDialog() {
		$('.lot-admin-new').slideDown();
	}

	function closeNewLotDialog() {
		$('.lot-admin-new').slideUp();
	}

	$('.add-new-lot-trigger').live('click', function() {
		$('.lot-admin-new').slideToggle();

	});

	$('.cancel-lot-trigger').live('click', function() {
		closeNewLotDialog();
    });

	var Lot = Backbone.Model.extend({
		url: function() {
			if(this.isNew()) {
				return '/items/';
			} else {
				return '/items/' + this.get('id') + '.json';
			}
		}
	});

	var Lots = Backbone.Collection.extend({
		model: Lot
	});

	var LotView = Backbone.View.extend({
		lotTemplate: $('#lot-item').html() == undefined ? '' : _.template($('#lot-item').html()),
		initialize: function() {
			this.render();
		},
		render: function() {
			this.$el.html(this.lotTemplate({lot: this.model.attributes}));
		}
	});

	var LotsView = Backbone.View.extend({
		el: $('.user-lots-admin'),
		initialize: function() {
			this.render();
			this.collection.bind('add', function() {
				this.render();
			}, this);
			this.collection.bind('remove', function() {
				this.render();
			}, this);
		},
		render: function() {
			var rch = _.reduce(
				_.map(this.collection.models, function(elem) {
					var lotView = new LotView({ model: elem});
					return lotView;
				}, this),
				function(m, elem) {
					return (m += elem.$el.html());
				},
				'',
				this
			);
			this.$el.hide().html(rch).fadeIn();
		}
	});

	if(window.lots) {
		var lotsM = _.map(
			lots, function(elem) {
				return new Lot(elem).set('id', elem._id);
			}
		);
		var AllLots = new Lots(lotsM);
		var AllLotsView = new LotsView({collection: AllLots});
	}

	$('.create-lot-trigger').live('click', function() {
		var newLotJSON = $(this).closest('form').serializeObject();
		console.log(newLotJSON);
		var newLotModel = new Lot(newLotJSON.item);
		newLotModel.save(null, {
			success: function(itemn) {
				console.log(itemn);
				AllLotsView.collection.push(itemn);
				closeNewLotDialog();
			},
			error: function() {
				console.err('error occurs while creating')
			}
		});
	});

	$('.delete-lot-trigger').live('click', function() {
		var lot_id = $(this).data('lot-id');
		console.log(AllLotsView.collection.first());
		var model_to_del = AllLotsView.collection.get(lot_id);
		model_to_del.destroy({
			success: function() {
				AllLotsView.collection.remove(model_to_del);
			},
			error: function() {
				console.log('error occurs while deleting');
			}
		});
	});*/
});







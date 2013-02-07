$(document).ready(function(){
	var Vguser = Backbone.Model.extend({
		urlRoot: '/users'
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

    $('#logout-trigger').live('click', function() {
        $.ajax({
            url: '/logout',
            type: 'GET',
            success: function(data){
	            if(data.status == 'OK') {
		            lgview.loggedIn = false;
		            $("#cuid").remove();
	                lgview.render();
	            } else {
		            console.warn(data.msg);
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
});







$(document).ready(function(){
	$('#loginForm').modal();

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

    $(document).on('click', '#logout-trigger', function() {
        $.ajax({
            url: '/logout',
            type: 'GET',
            success: function(){
                window.location.href='/';
	            console.log('we are here ');
            }
        });
    });

	$('#lg-form').ajaxForm(function(data) {
		if(data.status == 'OK') {
			$('#loginForm').modal('hide');
		} else {
			$('.err-lg').fadeIn().html(data.msg).delay(5000).fadeOut();
		}

	})
});

var Vguser = Backbone.Model.extend({
	id:'50b27f774747251109000004',
	loggedin: undefined,
	firstName:'Noname user',
	isAdmin:false,
	urlRoot: '/users'
});

var cur_user = new Vguser();
console.log(cur_user.url());
cur_user.fetch();
cur_user.set("name", "555");

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
		console.log('#logout-trigger....');
        $.ajax({
            url: '/login',
            type: 'DELETE',
            success: function(){
                window.location.href='/';
	            console.log('we are here ');
            }
        });
    });
});

var Vguser = Backbone.Model.extend({   
 id:'50b27f774747251109000004',
 loggedin: undefined,
 firstName:'Noname user',
 isAdmin:true,
 name: undefined,
 email: undefined,
 urlRoot: '/users'
});

var cur_user = new Vguser();
console.log(cur_user.url());
cur_user.fetch();




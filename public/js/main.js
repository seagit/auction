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
});

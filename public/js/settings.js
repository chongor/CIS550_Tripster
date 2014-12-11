window.addEventListener('load', function(){
	var update = function(key, val){
		$("#error-box").hide();
		$("#success-box").hide();
		$.ajax({
			type: "POST",
			url:"/api/user/update",
			dataType:"json",
			data:{field: key, value: val},
			success: function(data) {
				if (typeof data === "string"){
					try{
						data = JSON.parse(data);
					}catch(e){
						$("#error-msg").text("Could not parse response : " + data);
						$("#error-box").show();
						return;
					}
				}
				if (data.code === 200) {
					$("#success-box").show();
				} else {
					$("#error-msg").text(data.msg);
					$("#error-box").show();
				}
			}
		})
	}
	$("#set-gen").click(function(){
		$(this).addClass('active');
		$('#set-priv').removeClass('active');
		$('#settings-general').show();
		$('#settings-privacy').hide();
	});
	$("#set-priv").click(function(){
		$(this).addClass('active');
		$('#set-gen').removeClass('active');
		$('#settings-privacy').show();
		$('#settings-general').hide();
	});
	$("#change-name").click(function(e){
		e.preventDefault();
		update('name', $('#fullname').val());
	});
	$("#change-email").click(function(e){
		e.preventDefault();
		if((new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}")).test($('#email').val())){
			$("#ig-email").removeClass('has-error');
			update('email', $('#email').val());
		} else {
			$("#error-box").hide();
			$("#success-box").hide();
			$("#ig-email").addClass('has-error');
			$("#error-msg").text('Email address not well formatted!');
			$("#error-box").show();
		}
	});
	$("#change-affiliation").click(function(e){
		e.preventDefault();
		update('affiliation', $('#affiliation').val());
	});
	$("#change-interests").click(function(e){
		e.preventDefault();
		update('interests', $('#interests').val());
	});
	$("#change-phone").click(function(e){
		e.preventDefault();
		update('phone', $('#phone').val());
	});
});

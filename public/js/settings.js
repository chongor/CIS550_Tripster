window.addEventListener('load', function(){
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
});

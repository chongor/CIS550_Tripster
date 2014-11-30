window.addEventListener("load", function(){
	if(!localStorage){
		$("#remember").attr("disabled", "disabled");
		$("#remember").removeAttr("checked");
	}else{
		if(localStorage["credentials"] && localStorage["credentials"] != ""){
			$("#remember").attr("checked", "true");
		}else{
			$("#remember").removeAttr("checked");
		}
	}
	if(localStorage && localStorage["credentials"] && localStorage["credentials"] != ""){
		try{
			var up = JSON.parse(localStorage["credentials"]);
			$("#username").val(up.user);
			$("#password").val(up.pass);
		}catch(e){}
	}
	
	$("#login").click(function(e){
		if(e)
			e.preventDefault();
		var dc = document.getElementById("remember");
		if(dc && dc.checked){
			localStorage["credentials"] = JSON.stringify({
				user:$("#username").val(),
				pass:$("#password").val()
			});
		}else{
			localStorage["credentials"] = "";
			delete localStorage["credentials"];
		}
		$("#loginform").submit();
	});
});

window.addEventListener('load', function(){
	$("#add-friend").click(function(){
		$.ajax({
			type: "POST",
			url: "/api/user/friend",
			data: {
				"friend": $("#uid").text()
			},
		 	success: function(data){
		 		try{
		 			var d = JSON.parse(data);
		 		} catch(e){
		 			alert('Malformed response.\n' + d);
		 			return;
		 		}
				if(d.code === 200){
					$("#add-friend").text("Done.");
					$("#add-friend").attr('disabled','disabled');
				}else{
					alert(d.msg);
				}
			}
		});
	});
	
	$("#remove-friend").click(function(){
		$.ajax({
			type: "POST",
			url: "/api/user/unfriend",
			data: {
				"friend": $("#uid").text()
			},
		 	success: function(data){
		 		try{
		 			var d = JSON.parse(data);
		 		} catch(e){
		 			alert('Malformed response.\n' + d);
		 			return;
		 		}
				if(d.code === 200){
					$("#remove-friend").text("Done.");
					$("#remove-friend").attr('disabled','disabled');
				}else{
					alert(d.msg);
				}
			}
		});
	});
});

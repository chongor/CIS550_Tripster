var check = function(callback){
	$.ajax({
		type:"GET",
		url: "/api/user/notifications",
		dataType:"json",
		success: function(data){
			if(data.code !== 200){
				console.log(data);
				return;
			}
			$("#notifications-badge").text(data.notify.length);
			if(data.notify.length > 0){
				$("#notifications-badge").show();
			}else{
				$("#notifications-badge").hide();
			}
			$("#notifications-menu").empty();
			for(var i = 0; i < data.notify.length; i++){
				var n = data.notify[i];
				var listItem = $("<li><a href='#'>" + (n.data ? n.data.text : "[Error]") + "</a></li>");
				$("#notifications-menu").append(listItem);
				listItem.click(function(e){
					e.preventDefault();
					$.ajax({
						type:"POST",
						url:"/api/user/notifications/read",
						data:{"nid":n.nid},
						success:function(){
							if(n.data.url){
								window.location.assign(n.data.url);
							}
							$(listItem).hide();
						}
					});
				});
			}
			if(data.notify.length === 0){
				$("#notifications-menu").append("<li><a href=''>No notifications</a></li>");
			}
			callback();
		}
	});
}
window.addEventListener('load', function(){
	var lastCheckDone = false;
	check(function(){lastCheckDone = true;});
	setInterval(function(){
		if(!lastCheckDone){
			return;
		}
		lastCheckDone = false;
		check(function(){
			lastCheckDone = true;
		});
	},2500);
});

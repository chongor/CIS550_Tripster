window.addEventListener('load', function(){
	$.ajax({
		type: "GET",
		url: "/api/trip/" + $("#trip_id").text() + "/members",
		success: function(data){
			try{
				var d = JSON.parse(data);
			} catch(e){
				alert('Malformed response.\n' + d);
				return;
			}
			if(d.code === 200){
				var currentdiv = null;
				for(var i = 0; i < d.members.length; i++){
					if(i % 3 === 0){
						currentdiv = $("<div class='row'></div>");
						$("#members").append(currentdiv);
					}
					$(currentdiv).append('<div class="col-xs-6 col-md-4"><div class="thumbnail">'
					+ '<a href="/profile/' + d.members[i].user.login + '" >'
					+ '<img src="' + d.members[i].user.avatar + '?s=256" style="width:100%"/></a>'
					+ '<h4>' + d.members[i].user.fullname + '</h4>'
					+ '</div></div>');
				}
			}else{
				$("#members").append("<div class='alert alert-danger'>" + d.msg + "</div>");
			}
		}
	});
});

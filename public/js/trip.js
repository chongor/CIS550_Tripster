window.addEventListener('load', function(){

	var approve = function(uid) {
		$.ajax({
			type: "POST",
			url:"/api/trip/approve",
			dataType:"json",
			data:{newmember: uid, tid:+$("#trip_id").text()},
			success: function(success) {
				if (success) {
					window.location.reload();
				} else {
					alert('Try approving again later');
				}
			}
		})
	};

	// Get trip members
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
				var memberDiv = null;
				var requestDiv = null;
				if (d.isAdmin) {
					$('#requests').append('<h3>Requests</h3>');
				}
				for(var i = 0; i < d.members.length; i++){
					// Add members
					if (d.members[i].role.isMember) {
						if(i % 3 === 0){
							memberDiv = $('<div class="row"></div>');
							$("#members").append(memberDiv);
						}
						$(memberDiv).append('<div class="col-md-4"><div class="thumbnail">'
							+ '<a href="/profile/' + d.members[i].user.login + '" >'
							+ '<img src="' + d.members[i].user.avatar + '?s=128" style="width:100%"/></a>'
							+ '<h4>' + d.members[i].user.fullname + '</h4>'
							+ '</div></div>');
					}
					else {
						// Add requests
						requestDiv = $('<div class="row"></div>');
						$(requestDiv).append('<div class="col-md-4"><div class="thumbnail">'
							+ '<a href="/profile/' + d.members[i].user.login + '" >'
							+ '<img src="' + d.members[i].user.avatar + '?s=128"/></a></div><div>');
						$(requestDiv).append('<div class="col-md-8"><h4>' + d.members[i].user.fullname + '</h4><br/>');
						$(requestDiv).append('<button class="btn btn-primary" onclick="approve(' + d.members[i].user.uid + ')" style="margin-left:7px;">Approve</button></div>');
						$('#requests').append(requestDiv);
					}
				}
			}else{
				$("#members").append("<div class='alert alert-danger'>" + d.msg + "</div>");
			}
		}
	});
});

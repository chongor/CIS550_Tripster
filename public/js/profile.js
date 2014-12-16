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

	var inviteIsOpen = false;

	$("#invite-trip").click(function(){
		inviteIsOpen = !inviteIsOpen;
		if (!inviteIsOpen) {
			$("#invite-trip").text('Invite to Trip(s) ↓');
			$("#invitables").html('');
			$("#invitables").hide();
			return;
		}
		$.ajax({
			type: "GET",
			url: "/api/user/" + $("#uid").text() + "/invitables",
		 	success: function(data){
 				$("#invite-trip").text('Invite to Trip(s) ↑');
		 		var trips = data.invitables;
		 		if (trips && trips.length > 0) {
		 			$("#invitables").html('');
		 			console.log(trips);
		 			for (var i = 0; i < trips.length; i++) {
		 				var trip = $('<div class="row"></div>');
		 				var buttonCol = $('<div class="col-md-12">' + trips[i].description + '</div>');
		 				var button = $('<button class="btn btn-default pull-right">' + trips[i].description+ '</button>');
		 				buttonCol.append(button);
		 				trip.append(buttonCol);
		 				$(button).click((function(){
		 					var tid = trips[i].trip_id;
		 					return function(){
			 					$.ajax({
									type: "POST",
									url: "/api/user/invite",
									data: {
										"tid": tid,
										"target": $("#uid").text()
									},
									dataType: "json",
								 	success: function(data){
								 		if(typeof data === "string"){
								 			try{
								 				data = JSON.parse(data);
								 			}catch(e){}
								 		}
								 		if(data.code === 200){
								 			console.log('Successfully invited');
								 		} else  {
								 			alert(data.msg);
								 		}
									}
								});
		 					}
		 				})());
		 				$("#invitables").append(trip);
		 			}
		 		} else {
			 		var error = 'No trip to invite to.';
			 		$("#invitables").append(error);
			 		$("#invitables").show();
		 		}
			}
		});
	});
});

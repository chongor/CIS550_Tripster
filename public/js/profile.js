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

	// Get user's albums
	$.ajax({
		type: "GET",
		url: "/api/user/" + $("#uid").text() + "/albums",
		dataType:"json",
	 	success: function(data){
	 		if(data.code !== 200){
	 			return;
	 		}
	 		var albumlist = $("<div class='list-group'></div>");
	 		for(var i = 0; i < data.albums.length; i++){
	 			albumlist.append("<a href='/album/" + $("<div></div>").text(data.albums[i].id).html() + "' class='list-group-item'>" + $("<div></div>").text(data.albums[i].title).html() + "</a>");
	 		}
	 		$("#albums").empty();
	 		$("#albums").append(albumlist);
	 	}
	 });
	// Upon page load, get invitables
	$.ajax({
		type: "GET",
		url: "/api/user/" + $("#uid").text() + "/invitables",
	 	success: function(data){
	 		if(data.code !== 200){
	 			alert('Read Invite List Failed');
	 			return;
	 		}
	 		var trips = data.invitables;
	 		if (trips && trips.length > 0) {
	 			$("#invitables").html('');
	 			$('#invite-trip').show();
	 			console.log(trips);
	 			for (var i = 0; i < trips.length; i++) {
	 				var trip = $('<div class="row" style="padding-bottom:4px;" id="tripid' + trips[i].trip_id + '"></div>');
	 				var buttonCol = $('<div class="col-md-12">' + $("<div></div>").text(trips[i].description).html() + '</div>');
	 				var button = $('<button class="btn btn-default pull-right">Invite</button>');
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
							 			$('#tripid' + tid).fadeOut();
							 		} else  {
							 			alert('An error occurred. Try inviting again later.');
							 		}
								}
							});
	 					}
	 				})());
	 				$("#invitables").append(trip);
	 			}
	 		} else {
	 			$('#invite-trip').hide();
	 		}
		}
	});

	var inviteIsOpen = false;

	$("#invite-trip").click(function(){
		inviteIsOpen = !inviteIsOpen;
		if (!inviteIsOpen) {
			$("#invite-trip").text('Invite to ...');
			$("#invitables").html('');
			$("#invitables").hide();
			return;
		}
		$.ajax({
			type: "GET",
			url: "/api/user/" + $("#uid").text() + "/invitables",
		 	success: function(data){
 				$("#invite-trip").text('Hide List');
		 		var trips = data.invitables;
		 		if (trips && trips.length > 0) {
		 			$("#invitables").html('');
		 			console.log(trips);
		 			for (var i = 0; i < trips.length; i++) {
		 				var trip = $('<div class="row" id="tripid' + trips[i].trip_id +'"></div>');
		 				var buttonCol = $('<div class="col-md-12">' + $("<div></div>").text(trips[i].description).html() + '</div>');
		 				var button = $('<button class="btn btn-default pull-right">Invite</button>');
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
								 			$('#tripid' + tid).fadeOut();
								 		} else  {
								 			alert(data.msg);
								 		}
									}
								});
		 					}
		 				})());
		 				$("#invitables").append(trip);
		 				$("#invitables").show();
		 			}
		 		} else {
			 		var error = 'No trip to invite to.';
			 		$("#invitables").append(error);
			 		$("#invitables").show();
		 		}
			}
		});
		if (inviteIsOpen) {
			$("#invite-trip").text('Hide List');
			$("#invitables").show();
			return;
		}
		$("#invite-trip").text('Invite to ...');
		$("#invitables").hide();
	});

});

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

var showStars = function(rating){
	var starsCont = $("<div></div>");
	for(var i = 1; i * 2 <= rating; i++){
		starsCont.append($('<span class="glyphicon glyphicon-star"></span>'));
	}
	return starsCont;
}

var getRatings = function(start){
	if(typeof start === "undefined" || start === null){
		start = 0;
	}
	$.ajax({
		type: "GET",
		url: "/api/trip/" + $("#trip_id").text() + "/rating?start=" + start,
		dataType:"json",
		success: function(data){
			if(typeof data === "string"){
				try{
					data = JSON.parse(data);
				}catch(e){
					console.log('Parse ratings failed!');
					return;
				}
			}
			if(data.code === 200){
				for(var i = 0; i < data.rating.length; i++){
					var panel = $("<div class='panel panel-default'></div>");
					var pbody = $("<div class='panel-body'></div>");
					var pfoot = $("<div class='panel-heading'></div>");
					panel.append(pbody);
					panel.append(pfoot);
					pbody.append($("<a href='/profile/" + $("<div></div>").text(data.rating[i].user.login).html() + "'><img src='" + $("<div></div>").text(data.rating[i].user.avatar).html() + "' style='width:80px' class='pull-left' /></a>"));
					pbody.append($("<div style='margin-left: 85px; padding:10px;'>" + $("<div></div>").text(data.rating[i].comment).html() + "</div>"));
					pfoot.append($("<strong>" + $("<div></div>").text(data.rating[i].user.name).html() + " </strong>"));
					pfoot.append($("<span>" + (new Date(data.rating[i].time)).toLocaleString() + "</span>"));
					pfoot.append($("<div class='pull-right'>" + showStars(data.rating[i].rating).html() + "</div>"));
					$("#ratings").append(panel);
				}
				if(data.rating.length === 0){
					$("#ratings").append("<div class='well'>No ratings yet!</div>");
				}
			}else{
				$("#ratings").empty();
				$("#ratings").append("<div class='well'>Error getting ratings!</div>");
			}
		}
	});
}

window.addEventListener('load', function(){

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
				var memberDiv = null, j = 0, requestNum = 0;
				if (d.isAdmin) {
					$('#requests').append('<h3>Requests</h3>');
				}
				if (d.role && !d.role.isMember) {
					$("#join-btn").show();
					if (d.role.isInvited) {
						$("#join-btn").text('Accept Invite');
					} else if (d.role.isRequested) {
						$("#join-btn").text('Request Sent');
						$('#join-btn').attr("disabled", "disabled");
					} else {
						$("#join-btn").click(requestJoin(e));
					}
				}
				for(var i = 0; i < d.members.length; i++){
					// Add members
					if (d.members[i].role.isMember) {
						if(j % 3 === 0){
							memberDiv = $('<div class="row"></div>');
							$("#members").append(memberDiv);
						}
						$(memberDiv).append('<div class="col-md-4"><div class="thumbnail">'
							+ '<a href="/profile/' + d.members[i].user.login + '" >'
							+ '<img src="' + d.members[i].user.avatar + '?s=128" style="width:100%"/></a>'
							+ '<h4>' + $("<div></div>").text(d.members[i].user.fullname).html() + '</h4>'
							+ '</div></div>');
						j ++;
					} else if (d.members[i].role.isRequested) {
						// Add requests
						requestNum += 1;
						var requestDiv = $('<div class="row"></div>');
						$(requestDiv).append('<div class="col-md-4"><div class="thumbnail">'
							+ '<a href="/profile/' + d.members[i].user.login + '" >'
							+ '<img src="' + d.members[i].user.avatar + '?s=128"/></a></div><div>');
						$(requestDiv).append('<div class="col-md-8"><h4>' + $("<div></div>").text(d.members[i].user.fullname).html() + '</h4><br/>');
						$(requestDiv).append('<button class="btn btn-primary" onclick="approve(' + d.members[i].user.uid + ')" style="margin-left:7px;">Approve</button></div>');
						$('#requests').append(requestDiv);
					}
				}
				if(requestNum === 0){
					$("#requests").append("<div class='well'>No Requests</div>");
				}
			}else{
				$("#members").append("<div class='alert alert-danger'>" + d.msg + "</div>");
			}
		}
	});

	// Add new item to trip checklist
	var addItemIsHidden = true;

	$('#additem').click(function(e) {
		if (addItemIsHidden) {
			$('#newitem').show();
			$('#additem').text('- Add Item')
		} else {
			$('#newitem').hide();
			$('#additem').text('+ Add Item')
		}
		addItemIsHidden = !addItemIsHidden;
	});

	$('#itemdescription').keypress(function(e) {
		if (e.which === 13) {
			if ($('#itemdescription').val() === '') {
				alert('Please fill in an item');
				return;
			}
			e.preventDefault();
			$.ajax({
				type: "POST",
				url: "/api/trip/" + $("#trip_id").text() + "/checklist",
				dataType:"json",
				data: {tid: $("#trip_id").text(), description: $('#itemdescription').val()},
				success: function(data){
					if(typeof data === "string"){
						try{
							data = JSON.parse(data);
						}catch(e){
							console.log('Parse checklist failed!');
							return;
						}
					}
					if(data.code === 200){
						$("#checklist ul").append('<li>' + data.desc + '</li>');
					} else {
						if (data.msg) {
							alert(data.msg);
						}
					}
				}
			});
		}
	});


	// Get trip checklist
	$.ajax({
		type: "GET",
		url: "/api/trip/" + $("#trip_id").text() + "/checklist",
		dataType:"json",
		success: function(data){
			if(typeof data === "string"){
				try{
					data = JSON.parse(data);
				}catch(e){
					console.log('Parse checklist failed!');
					return;
				}
			}
			if(data.code === 200){
				var list = $("<ul></ul>");
				for(var i = 0; i < data.checklist.length; i++){
					list.append("<li>" + $("<div></div>").text(data.checklist[i].desc).html() + "</li>");
				}
				$("#checklist").append(list);
				if(data.checklist.length === 0){
					$("#checklist").append("<small>Nothing In Checklist</small>");
				}
			}else{
				$("#checklist").append("<p>Unable to get checklist</p>");
			}
		}
	});
	
	// Get trip ratings
	var rindex = 0;
	getRatings(rindex);
	
	// Get schedules
	$.ajax({
		type: "GET",
		url: "/api/trip/" + $("#trip_id").text() + "/schedule",
		dataType:"json",
		success: function(data){
			if(typeof data === "string"){
				try{
					data = JSON.parse(data);
				}catch(e){
					console.log('Parse schedule failed!');
					return;
				}
			}
			if(data.code === 200){
				$("#schedule").empty();
				var list = $("<div class='list-group'></div>");
				for(var i = 0; i < data.schedules.length; i++){
					var item = $("<a class='list-group-item' href='/location/" + $("<div></div>").text(data.schedules[i].lid).html() + "'>" + (new Date(data.schedules[i].trip_date)).toDateString() + ": " + $("<div></div>").text(data.schedules[i].name).html() + "</div>");
					$(list).append(item);
				}
				$("#schedule").append(list);
				if(data.schedules.length === 0){
					$("#schedule").append("<div class='well'>No schedules yet!</div>");
				}
			}else{
				$("#schedule").empty();
				$("#schedule").append("<div class='well'>Error getting schedule!</div>");
			}
		}
	});

	// Bind buttons
	$("#join-btn").click(function(e){
		e.preventDefault();
		$.ajax({
			type:"POST",
			url:"/api/trip/request",
			dataType:"json",
			data:{
				"tid": $("#trip_id").text()
			},
			success:function(data){
				if(typeof data === "string"){
					try{
						data = JSON.parse(data);
					}catch(e){
						return;
					}
				}
				if(data.code === 200){
					window.location.reload();
				}else{
					alert('Join trip failed. Please try again later.');
				}
			}
		});
	});
});

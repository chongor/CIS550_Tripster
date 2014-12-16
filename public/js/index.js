function updateFeed(){
	$.ajax({
		type:"GET",
		url:"/api/user/newsfeed",
		dataType:"json",
		success: function(data){
			if(typeof data === "string"){
				try{
					data = JSON.parse(data);
				}catch(e){
					return;
				}
			}
			if(data.code === 200){
				$("#feed-stream").empty();
				for(var i = 0; i < data.feed.length; i++){
					var feeditem = data.feed[i];
					$("#feed-stream").append("<div class='status panel panel-default'>"
						+ "<div class='panel-body'>" + $("<div></div>").text(feeditem.newsfeed).html()
						+ "</div><div class='panel-heading'>Created " + (new Date(feeditem.time)).toLocaleString()
						+ "</div></div>");
				}
			}
		}
	});
};

window.addEventListener('load', function(){
	updateFeed();
	$.ajax({
		type: "GET",
		url: "/api/user/trips",
		dataType: "json",
		success: function(data){
			// Assemble both own and participating in
			if(typeof data === "string"){
				try{
					data = JSON.parse(data);
				}catch(e){}
			}
			$("#owntrips").empty();
			$("#membertrips").empty();
			if(data.code === 200){
				for(var i = 0; i < data.owntrips.length; i++){
					$("#owntrips").append(""
						+ "<a class='list-group-item' href='/trip/" + data.owntrips[i].trip_id + "'>"
						+ $("<div></div>").text(data.owntrips[i].name).html()
						+ "</a>");
				}
				for(var i = 0; i < data.membertrips.length; i++){
					$("#membertrips").append(""
						+ "<a class='list-group-item' href='/trip/" + data.membertrips[i].trip_id + "'>"
						+ $("<div></div>").text(data.membertrips[i].name).html()
						+ "</a>");
				}
				if(data.owntrips.length === 0){
					$("#owntrips").append("<div class='list-group-item'>No Records</div>");
				}
				if(data.membertrips.length === 0){
					$("#membertrips").append("<div class='list-group-item'>No Records</div>");
				}
			}else{
				$("#owntrips").append("<div class='list-group-item'>No Records</div>");
				$("#membertrips").append("<div class='list-group-item'>No Records</div>");
			}
		}
	});

	// Friend recommendations
	$.ajax({
		type: "GET",
		url: "/api/user/recommend/friends",
		dataType: "json",
		success: function(data){
			if(typeof data === "string"){
				try{
					data = JSON.parse(data);
				}catch(e){}
			}
			$("#recommend-friends").empty();
			if(data.code === 200){
				for(var i = 0; i < data.recommend.length; i++){
					$("#recommend-friends").append(""
						+ "<a class='list-group-item' href='/profile/" + data.recommend[i].username + "'>"
						+ "<img src='" + data.recommend[i].avatar + "?s=32' class='pull-left' style='width:32px; height:32px;'>"
						+ "<div style='margin-left:40px; margin-bottom:12px;'>" + data.recommend[i].fullname + "</div>"
						+ "</a>");
				}
				if(data.recommend.length === 0){
					$("#recommend-friends").append("<div class='list-group-item'>No Records</div>");
				};
			}else{
				$("#recommend-friends").append("<div class='list-group-item'>No Records</div>");
			}
		}
	});

	// Bind the ui
	$("#post-type-link").click(function(e){
		e.preventDefault();
		$("#album-picker").hide();
		$(".ptype").removeClass('btn-info').addClass('btn-default');
		$(this).addClass('btn-info').removeClass('btn-default');;
		$("#post-type").val('url');
		$("#url").show();
		$("#upload").hide();
	});

	$("#post-type-image").click(function(e){
		e.preventDefault();
		$("#album-picker").show();
		$(".ptype").removeClass('btn-info').addClass('btn-default');
		$(this).addClass('btn-info').removeClass('btn-default');
		$("#post-type").val('photo');
		$("#url").hide();
		$("#upload").show();
	});

	$("#post-type-video").click(function(e){
		e.preventDefault();
		$("#album-picker").show();
		$(".ptype").removeClass('btn-info').addClass('btn-default');
		$(this).addClass('btn-info').removeClass('btn-default');
		$("#post-type").val('video');
		$("#url").hide();
		$("#upload").show();
	});

	$("#privacy-public").click(function(e){
		e.preventDefault();
		$(this).parent().addClass('active');
		$("#privacy-private").parent().removeClass('active');
		$("#post-privacy").val('0');
		$("#btn-privacy").html($(this).html() + "<span class='caret'></span>");
	});

	$("#privacy-private").click(function(e){
		e.preventDefault();
		$(this).parent().addClass('active');
		$("#privacy-public").parent().removeClass('active');
		$("#post-privacy").val('1');
		$("#btn-privacy").html($(this).html() + "<span class='caret'></span>");
	});

});

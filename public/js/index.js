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
						+ "<div class='panel-body'>" + feeditem.newsfeed
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
			if(typeof data === "string"){
				try{
					data = JSON.parse(data);
				}catch(e){}
			}
			$("#mytrips").empty();
			if(data.code === 200){
				for(var i = 0; i < data.trips.length; i++){
					$("#mytrips").append(""
						+ "<a class='list-group-item' href='/trip/" + data.trips[i].trip_id + "'>"
						+ data.trips[i].name
						+ "</a>");
				}
				if(data.trips.length === 0){
					$("#mytrips").append("<div class='list-group-item'>No Records</div>");
				};
			}else{
				$("#mytrips").append("<div class='list-group-item'>No Records</div>");
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
	});
	
	$("#post-type-image").click(function(e){
		e.preventDefault();
		$("#album-picker").show();
		$(".ptype").removeClass('btn-info').addClass('btn-default');
		$(this).addClass('btn-info').removeClass('btn-default');
		$("#post-type").val('image');
	});
	
	$("#post-type-video").click(function(e){
		e.preventDefault();
		$("#album-picker").show();
		$(".ptype").removeClass('btn-info').addClass('btn-default');
		$(this).addClass('btn-info').removeClass('btn-default');
		$("#post-type").val('video');
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

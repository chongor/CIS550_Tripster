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
					try{
						var itemdata = JSON.parse(feeditem.newsfeed);
					} catch(e) {
						var itemdata = {'type':'text', 'data': feeditem.newsfeed };
					}
					// Guess some facts about item
					if(!itemdata.type){
						if(itemdata.trip_id){
							itemdata.type = 'trip';
						} else {
							itemdata.type = 'album';
						}
					}
					var panel = $("<div class='status panel panel-default group-filter-newsfeed group-filter-" + itemdata.type + "'></div>");
					var pbody = $("<div class='panel-body'></div>");
					var pfoot = $("<div class='panel-heading'></div>");

					switch(itemdata.type){
						case 'text':{
							pbody.append("<div>" + $("<div></div>").text(itemdata.data).html() + "</div>");
						}
						break;
						case 'video':{
							var main = $("<div></div>");
							main.append("<strong><a href='/profile/" + $("<div></div>").text(itemdata.owner.login).html() + "'>" + $("<div></div>").text(itemdata.owner.name).html() + "</a></strong> uploaded a video:");
							main.append("<div class='innerbox'><h2><a href='/video/" + $("<div></div>").text(itemdata.id).html() + "'>" +$("<div></div>").text(itemdata.title).html() +"</a></h2><video controls='true' style='width:100%'><source src='" + $("<div></div>").text(itemdata.url).html() + "'/></video></div>");
							pbody.append(main);
						}break;
						case 'photo':{
							var main = $("<div></div>");
							main.append("<strong><a href='/profile/" + $("<div></div>").text(itemdata.owner.login).html() + "'>" + $("<div></div>").text(itemdata.owner.name).html() + "</a></strong> uploaded a photo:");
							main.append("<div class='innerbox'><h2><a href='/photo/" + $("<div></div>").text(itemdata.id).html() + "'>" +$("<div></div>").text(itemdata.title).html() +"</a></h2><img class='img-responsive' src='" + $("<div></div>").text(itemdata.url).html() + "'/></div>");
							pbody.append(main);
						}break;
						case 'album':{
							var main = $("<div></div>");
							main.append("<strong><a href='/profile/" + $("<div></div>").text(itemdata.owner.login).html() + "'>" + $("<div></div>").text(itemdata.owner.name).html() + "</a></strong> uploaded an album:");
							main.append("<div class='innerbox'><h2><a href='/album/" + $("<div></div>").text(itemdata.id).html() + "'>" +$("<div></div>").text(itemdata.title).html() +"</a></h2><img class='img-responsive' src='/album/" + $("<div></div>").text(itemdata.id).html() + "/cover'/><p>" + $("<div></div>").text(itemdata.description).html() + "</p></div>");
							pbody.append(main);
						}break;
						case 'trip':{
							var main = $("<div></div>");
							main.append("<strong><a href='/profile/" +  $("<div></div>").text(itemdata.owner.login).html()  + "'>" + $("<div></div>").text(itemdata.owner.name).html() + "</a></strong> uploaded an album:");
							main.append("<div class='innerbox'><h2><a href='/trip/" + $("<div></div>").text(itemdata.trip_id).html() + "'>" +$("<div></div>").text(itemdata.name).html() +"</a></h2><p>" + $("<div></div>").text(itemdata.description).html() + "</p></div>");
							pbody.append(main);
						}break;
						default: {
							console.log(itemdata);
						}break;
					}
					pfoot.append($("<span>Created " + (new Date(feeditem.time)).toLocaleString() + "</span>"));

					panel.append(pbody);
					panel.append(pfoot);
					$("#feed-stream").append(panel);
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

	// Trip recommendations
	$.ajax({
		type: "GET",
		url: "/api/user/recommend/trips",
		dataType: "json",
		success: function(data){
			if(typeof data === "string"){
				try{
					data = JSON.parse(data);
				}catch(e){}
			}
			$("#recommend-trips").empty();

			if(data.code === 200){
				for(var i = 0; i < data.recommend.length; i++){
					$("#recommend-trips").append(""
						+ "<a class='list-group-item' href='/trip/" + data.recommend[i].trip_id + "'>"
						+ "<div style='margin-left:40px; margin-bottom:12px;'>" + $("<div></div>").text(data.recommend[i].title).html() + "</div>"
						+ "</a>");
				}
				if(data.recommend.length === 0){
					$("#recommend-trips").append("<div class='list-group-item'>No Records</div>");
				};
			}else{
				$("#recommend-trips").append("<div class='list-group-item'>No Records</div>");
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

	$(".filters-list-item").click(function(e){
		e.preventDefault();
		$(".filters-list-item").removeClass('active');
		$(this).addClass('active');
		var id = $(this).attr("id");
		$(".group-filter-newsfeed").hide();
		$(".group-" + id).show();
	});
});

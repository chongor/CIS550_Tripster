function showStars(rating){
	var starsCont = $("<div></div>");
	for(var i = 1; i * 2 <= rating; i++){
		starsCont.append($('<span class="glyphicon glyphicon-star"></span>'));
	}
	return starsCont;
}

window.addEventListener('load', function (){
	$.ajax({
		type: "GET",
		url: "/api/media/" + $("#media-id").text() + "/ratings",
		dataType: "json",
		success: function(data){
			if(typeof data === "string"){
				try{
					data = JSON.parse(data);
				} catch(e) {
				
				}
			}
			if(data.code === 200){
				$("#rating-value").text(data.rating === null ? "No Ratings Yet" : data.rating);
				$("#rating-star").html(showStars(data.rating === null ? 0 : data.rating).html());
				for(var i = 0; i < data.comments.length; i++){
					var comment = data.comments[i];
					var pbody = $("<div class='panel-body'></div>");
					var pfoot = $("<div class='panel-heading'></div>");
					pbody.append($("<img class='img-responsive pull-left' style='width:80px' src='" + comment.user.avatar + "' />"));
					pbody.append($("<div style='margin-left:80px; padding:5px 15px 5px 15px;'>" + $("<div></div>").text(comment.comment).html() + "</div>"));
					pfoot.append((new Date(comment.time)).toLocaleString());
					var stars = showStars(comment.rating);
					stars.addClass("pull-right");
					pfoot.append(stars);
					var panel = $("<div class='panel panel-default'></div>").append(pbody).append(pfoot);
					$("#comments").append(panel);
				}
				if(data.comments.length === 0){
					$("#comments").append("<div class='well'>No Ratings Yet</div>");
				}
			}else{
				console.log(data);
			}
		}
	});
});

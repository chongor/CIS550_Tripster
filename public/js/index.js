window.addEventListener('load', function(){
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
});

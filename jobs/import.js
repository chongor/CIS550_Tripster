var xml = require("node-xml");
var config = require("../config.js");
var mysql = require("mysql");
var fs = require("fs");

/** Initialize the parser and the DB connection. **/
var connection = mysql.createConnection(config.db);
connection.connect();
try{
	var rs = fs.createReadStream("output.xml");
}catch(e){
	console.log(e.stack);
	process.exit(0);
}
/** Define DB Write helper **/
function writeToDB(tableName, data, callback){
	// Generate the keys
	var keys = [], vals = [];
	for(var key in data){
		keys.push("`" + key + "`");
		vals.push("'" + data[key].replace("'","\\'") + "'");
	}
	connection.query("INSERT INTO `" + tableName +"` (" + keys.join(",") + 
	") VALUES (" + vals.join(",") + ")", function(err, rows){
		if(err){
			console.log("[Err]");
			console.log(err);
		}
		console.log(data);
		callback();
	});
}

var xparser = new xml.SaxParser(function(parser){
	var currentTable = null;
	var currentTuple = null;
	var currentElem = null, currentElemType = null;

	var countRecords = 0;
	parser.onStartElementNS(function(elem, attrs, prefix, uri, namespaces){
		switch(elem){
			case "database":{
				// Reset Global State
				console.log("[Log] Enter database!");
				currentTable = null;
				currentTuple = null;
				return;
			} break;
			case "tuple":{
				if(currentTable === null){
					throw Error("Table not defined before ");
				}
				if(currentTuple !== null){
					break; // Actually a field called tuple
				}
				currentTuple = {};
				countRecords++;
				return;
			} break;
		}
		if(currentTable === null){
			currentTable = elem;
			countRecords = 0;
			console.log("[Log] Entering table `" + currentTable + "`");
			return;
		}else{
			if(currentTuple === null){
				console.log("[Err] Did not encounter <tuple>");
				return;
			}
			currentTuple[elem] = null;
			currentElem = elem;
			if(attrs["type"]){
				currentElemType = attrs["type"];
			}
		}
	});

	parser.onEndElementNS(function(elem){
		switch(elem){
			case "database":{
				console.log("[Log] Encountered end of database.");
				connection.end();
				process.exit(0);
				return;
			}
			case "tuple":{
				// Write tuple to db
				xparser.pause();
				if(!currentTable){
					console.log("[War] Cannot write " + JSON.stringify(currentTuple) + " to no table.");
				}
				writeToDB(currentTable, currentTuple, function(){
					xparser.resume();
				});
				currentTuple = null;
				return;
			}
		}
		if(currentTuple !== null){
			if(elem !== currentElem){
				console.log("[Err] Expected close tag for [" + currentElem + "], got " + elem + ".");
				return;
			}
			currentElem = null;
		}
		if(currentTuple === null){
			if(elem !== currentTable){
				console.log("[Err] Expected close tag for `" + currentTable + "`, got " + elem + ".");
				return;
			}
			console.log("[Log] Wrote " + countRecords + " record(s) into " + currentTable);
			currentTable = null;
		}
	});

	parser.onCharacters(function(text){
		if(currentTuple === null && currentElem === null && currentTable === null){
			return;
		}
		if(currentTuple === null || currentElem === null || currentTable === null){
			console.log("[War] Encountered characters in unexpected location.");
			return;
		}
		if(currentElemType !== null){
			currentTuple[currentElem] = text;
		}else{
			currentTuple[currentElem] = text;
		}
	});

	parser.onWarning(function(msg){
		console.log('[War] ' + msg);
	});
	parser.onError(function(msg){
		console.log('[Err] ' + msg);
	});
});

rs.on('data', function(chunk) {
	xparser.parseString(chunk.toString("UTF-8"));
})
rs.on('end', function(){
	console.log("[Log] File Successfully Read.");
});

try{
	
	rs.read();
}catch(e){
	console.log("[Err] Parse file failed");
	process.exit(0);
}

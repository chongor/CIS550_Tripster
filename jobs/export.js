var XMLWriter = require("xml-writer");
var config = require("../config.js");
var mysql = require("mysql");
var fs = require("fs");

/** Functions **/
function outputTable(tableName, xml, cb){
	connection.query("SELECT * FROM `" + tableName +"`", function(err, rows){
		console.log("[Log] Generating XML data for table `" + tableName +"`.");
		if(err){
			console.log("[Err]" );
			console.log(err);
			return;
		}
		xml.startElement(tableName);
		for(var row in rows){
			xml.startElement("tuple");
			for(var field in rows[row]){
				if(rows[row][field] instanceof Date || rows[row][field].toISOString != null){
					rows[row][field] = rows[row][field].toISOString();
				}
				xml.writeElement(field, rows[row][field].toString());
			}
			xml.endElement();
		}
		xml.endElement();
		cb();
	});
};

/** Initiate the conenction and start off the XML **/
var connection = mysql.createConnection(config.db);

var ws = fs.createWriteStream('output.xml');
var xmldoc = new XMLWriter(false, function(string, encoding){
	ws.write(string, encoding);
});
xmldoc.startDocument('1.0', 'UTF-8');
var dbElem = xmldoc.startElement('database');


connection.connect();

connection.query("SHOW TABLES FROM " + config.db.database, function(err, rows){
	if(err){
		throw new Error("Could not select table names!");
	}
	var tables = [];
	for(var row in rows){
		for(var field in rows[row]){
			tables.push(rows[row][field]);
			break; // Only need first field
		}
	}
	// Now invoke recursion on the tables
	var onFinish = function(){
		if(tables.length > 0){
			outputTable(tables.shift(), xmldoc, onFinish);
		}else{
			console.log("[Log] Successfully finished.");
			xmldoc.endElement(); //Close </database>
			xmldoc.endDocument(); //End document;
			connection.end();
			ws.end();
		}
	}
	onFinish();
});

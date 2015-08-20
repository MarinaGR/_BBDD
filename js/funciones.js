var db;
var name_db="Dummy_DB";

function onBodyLoad()
{		
	document.addEventListener("deviceready", onDeviceReady, false);
	db = window.openDatabase(name_db, "1.0", "Just a Dummy DB", 200000);

	//va en ondeviceready
	db.transaction(populateDB, errorCB, successCB);   
}

function onDeviceReady()
{					
	/*
	document.addEventListener("backbutton", onBackKeyDown, false);
	document.addEventListener("menubutton", onMenuKeyDown, false); 
	
	db.transaction(populateDB, errorCB, successCB);   
	*/
	 
}    

//create table and insert some record
function populateDB(tx) {
	/*tx.executeSql('CREATE TABLE IF NOT EXISTS points (id TEXT NOT NULL PRIMARY KEY, nombre TEXT NOT NULL, descripcion TEXT NULL, imagenb64 TEXT NULL)');

	$.each(my_points, function(indice, punto)
	{
		tx.executeSql('SELECT * FROM points WHERE id=(?)',[punto[0]],
			function(tx,result) 
			{
				if(result.rows.length==0)
					tx.executeSql('INSERT INTO points(id,nombre,descripcion,imagenb64) VALUES (?,?,?,?)', [ punto[0], punto[1], punto[2],punto[3] ]);
				
			}, errorCB);
	});*/
	console.log("1");
	exportTable(tx);

}

//function will be called when an error occurred
function errorCB(err) {
	alert("Error processing SQL");
	console.log("ERROR: "+err.code+" "+err.message);
}

//function will be called when process succeed
function successCB() {
	console.log("success!");
	//db.transaction(queryDB,errorCB);
}

//select all from points
function queryDB(tx){
	console.log("2");
	tx.executeSql('SELECT * FROM points',[],querySuccess,errorCB);
}

function querySuccess(tx,result){
	console.log("3");
	$('#listado').empty();
	$.each(result.rows,function(index){
		var row = result.rows.item(index);
		if(row['imagenb64']!=null)
			$('#listado').append('<li><a href="#"><img class="ui-li-thumb" height="100%" src="data:image/jpg;base64, '+row['imagenb64']+'" /><h3 class="ui-li-heading" id="'+row['id']+'">'+row['nombre']+'</h3><p class="ui-li-desc">'+row['descripcion']+'</p></a></li>');
		else
			$('#listado').append('<li><a href="#"><img class="ui-li-thumb"  src="" /><h3 class="ui-li-heading" id="'+row['id']+'">'+row['nombre']+'</h3><p class="ui-li-desc">'+row['descripcion']+'</p></a></li>');
	});
	$('#listado').listview();
}
	
/*IMPORT*/
function importDB() {	
	console.log("4");
	$.get('./myDatabase.sql', function(response) {
	  console.log("got db dump!", response);
	  var db = openDatabase('myDatabase', '1.0', 'myDatabase', 10000000);
	  processQuery(db, 2, response.split(';\n'), 'myDatabase'); 
	});
}
//The processQuery function process all the statements one by one, and silently ignores errors.
function processQuery(db, i, queries, dbname) {
	console.log("5");
    if(i < queries.length -1) {
      console.log(i +' of '+queries.length);
      if(!queries[i+1].match(/(INSERT|CREATE|DROP|PRAGMA|BEGIN|COMMIT)/)) {
        queries[i+1] = queries[i]+ ';\n' + queries[i+1];
         return processQuery(db, i+1, queries, dbname);
      }
      console.log('------------>', queries[i]);
      db.transaction( function (query){ 
        query.executeSql(queries[i]+';', [], function(tx, result) {
          processQuery(db, i +1, queries,dbname);  
        });          
      }, function(err) { 
      console.log("Query error in ", queries[i], err.message);                          
      processQuery(db, i +1, queries, dbname);   
      });
  } else {
      console.log("Done importing!");
  }
}
/*EXPORT*/
//  Export current table as SQL script
function exportTable(tx) {
	console.log("6");
	tx.executeSql("SELECT tbl_name, sql from sqlite_master WHERE type = 'table'", [], function(tx, result) 
	{		
		if (result.rows && result.rows.item(0)) 
		{
			var _exportSql="";
	
			$.each(result.rows,function(index,fila){
				
				if(fila.tbl_name!="__WebKitDatabaseInfoTable__" && fila.tbl_name!="sqlite_sequence")
				{
					_exportSql = fila["sql"];
					
					tx.executeSql("SELECT * FROM " + fila.tbl_name + ";", [], function(transaction, results) {
						if (results.rows) {
							for (var i = 0; i < results.rows.length; i++) {
								var row = results.rows.item(i);
								var _fields = [];
								var _values = [];
								for (col in row) {
									_fields.push(col);
									_values.push('"' + row[col] + '"');
								}
								_exportSql += ";\nINSERT INTO " + fila.tbl_name + "(" + _fields.join(",") + ") VALUES (" + _values.join(",") + ")";
							}
							
							console.log(_exportSql);
						}
						
					});
				}
			});
		}
	}, errorCB);
	
}
function dobackup() {
	$.when(
		backup("notes"), 
		backup("log")
	).then(function(notes, log) {
		console.log("All done");
		//Convert to JSON
		var data = {notes:notes, log:log};
		var serializedData = JSON.stringify(data);
		console.log(serializedData);
	});
}
function backup(table) {
	var def = new $.Deferred();
	db.readTransaction(function(tx) {
		tx.executeSql("select * from "+table, [], function(tx,results) {
			var data = convertResults(results);
			console.dir(data);
			def.resolve(data);
		});
	}, dbError);

	return def;
}
/*END IMPORT/EXPORT*/

function onBackKeyDown()
{
	if(window.location.href.search(new RegExp("index.html$")) != -1) 
	{		
		navigator.app.exitApp();
		return false;
	}
	window.history.back();
}
function onMenuKeyDown()
{
	window.location.href='menu.html';
}
function onOutKeyDown()
{
	navigator.app.exitApp();
	return false;
}

function setLocalStorage(keyinput,valinput) 
{
	if(typeof(window.localStorage) != 'undefined') { 
		window.localStorage.setItem(keyinput,valinput); 
	} 
	else { 
		alert("no localStorage"); 
	}
}
function getLocalStorage(keyoutput)
{
	if(typeof(window.localStorage) != 'undefined') { 
		return window.localStorage.getItem(keyoutput); 
	} 
	else { 
		alert("no localStorage"); 
	}
}
function setSessionStorage(keyinput,valinput)
{
	if(typeof(window.sessionStorage) != 'undefined') { 
		window.sessionStorage.setItem(keyinput,valinput); 
	} 
	else { 
		alert("no sessionStorage"); 
	}
}
function getSessionStorage(keyoutput)
{
	if(typeof(window.sessionStorage) != 'undefined') { 
		return window.sessionStorage.getItem(keyoutput); 
	} 
	else { 
		alert("no sessionStorage"); 
	}
}
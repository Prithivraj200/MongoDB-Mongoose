const MongoClient=require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/First",(err,db)=>{
	if(err) console.log(err);
	console.log("connected to mongo db");
	db.close();
})
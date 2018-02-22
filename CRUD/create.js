const MongoClient=require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/First",(err,db)=>{
	if(err) console.log(err);
	console.log("connected to mongo db");
	db.collection('Todo').insertOne({
		name:'Prithivraj K',
		aoi:'Ionic'
	},(err,res)=>{
		if(err) console.log(err);
		console.log("Inserted successfully!");
	})
	db.close();
})
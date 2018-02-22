const { MongoClient, ObjectID }=require('mongodb');

MongoClient.connect("mongodb://localhost:27017/First",(err,db)=>{
	if(err) console.log(err);
	console.log("connected to mongo db");
	db.collection('Todo').findOneAndUpdate({
		_id:new ObjectID("5a8565b7f2245415ad8a9711")
	    },{
	    	$set:{
	    		aoi:'Typescript',
	    		age:24
	    	}
	    },{
	    	returnOriginal:false
	    }).then(
		(data)=>{
			console.log("Data ",data);
		},(err)=>{
			console.log("ERR ",err);
		})
	db.close();
})
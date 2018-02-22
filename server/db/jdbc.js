var mongoose=require('mongoose');
const {MongoClient}=require('mongodb');

mongoose.Promise=global.Promise;

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/Users");

var mongoDB=(callback)=>{
                 MongoClient.connect("mongodb://localhost:27017/First",(err,db)=>{
                 	  callback(err,db);
                 })
             }

module.exports={
	mongoose,
	mongoDB
}
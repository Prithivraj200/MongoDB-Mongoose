const _=require('lodash');
const express=require('express');
const bodyParser=require('body-parser');
const {MongoClient,ObjectID}=require('mongodb');
var err,db;

const port=process.env.PORT || 3000;

const jdbc=require("./db/jdbc");
const {mongoose}=jdbc;
const {profile,User}=require("./models/Profile");

jdbc.mongoDB((_err,_db)=>{
	err=_err;
	db=_db;
})

 var app=express();

 app.use(bodyParser.json());

 app.get("/",(req,res)=>{
 	res.send("<h1>Welcome to Node REST API</h1>");
 })

 var auth=(req,res,next)=>{
   var token=req.header('x-auth');

   User.findByToken(token).then((user)=>{
      if(!user) Promise.reject()
      req.user=user;
      req.token=token;
      next();
   }).catch((err)=>{
      res.status(401).send(err);
   })  
 }

 app.get('/getUser',auth,(req,res)=>{
    res.send(req.user);
 })

 app.post('/user/login',(req,res)=>{
    var body=_.pick(req.body,['email','password']);
    User.findByCredentials(body).then((user)=>{
       return user.generateAuthToken().then((token)=>{
          res.header('x-auth',token).send(user);
      })
    }).catch((e)=>{
          res.status(404).send(e);
      })
 })

 app.post('/postUser',(req,res)=>{
 	var body=_.pick(req.body,["email","password"]);
 	var user=new User(body);
 	    user.save().then(()=>{
        return user.generateAuthToken(); 	    	
 	    }).then((token)=>{
          res.header('x-auth',token).send(user);
      }).catch((err)=>{
        res.status(400).send(err);
      })
 })

 app.delete('/user/logout',auth,(req,res)=>{
   req.user.removeToken(req.token).then((data)=>{
      res.status(200).send();
   },()=>{
      res.status(401).send();
   })
 })

 app.post('/postProfile',auth,(req,res)=>{
 	var user=new profile({
               name:req.body.name,
               age:req.body.age,
               _creator:req.user._id
 	         })
 	    user.save().then((data)=>{
 	    	res.send(data);
 	    },(err)=>{
 	    	res.status(400).send(err);
 	    })
 })

  app.get('/getProfile',auth,(req,res)=>{
 	    profile.find({
        _creator:req.user._id
      }).then((data)=>{
 	    	res.send({data});
 	    },(err)=>{
 	    	res.status(400).send(err);
 	    })
  })

  app.get('/getProfile/:id',auth,(req,res)=>{
  	    var id=req.params.id;
  	    if(!ObjectID.isValid(id)){
  	    	return res.status(404).send("Not valid")
  	    }
 	    profile.find({
           _id:id,
          _creator:req.user._id
        }).then((data)=>{
 	    	if(!data) res.status(404).send("Not found")
 	    	res.send({data});
 	    },(err)=>{
 	    	res.status(400).send(err);
 	    })
  })

  app.patch("/updateProfile/:id",auth,(req,res)=>{
  	   var {id}=req.params;
  	   if(!ObjectID.isValid(id)) res.status(404).send("Not valid")
  	   profile.findOneAndUpdate({
        _id:id,
        _creator:req.user._id
        },{$set:req.body},{new:true}).then((data)=>{
  	   	  if(!data) res.status(404).send("Not found")
  	   	  res.send({data})
  	   }).catch((err)=>{
  	   	  res.status(400).send(err)
  	   })
  })

  app.delete('/deleteProfile/:id',auth,(req,res)=>{
  	    var id=req.params.id;
  	    if(!ObjectID.isValid(id)){
  	    	return res.status(404).send("Not valid")
  	    }
 	    profile.findOneAndRemove({
        _id:id,
        _creator:req.user._id
        }).then((data)=>{
 	    	if(!data) res.status(404).send("Not found")
 	    	res.send({data});
 	    },(err)=>{
 	    	res.status(400).send(err);
 	    })
  })

 app.post("/postProfiles",(req,res)=>{
	if(err) res.status(404).send(err);
	db.collection('Todo').insertOne(req.body,(errr,ress)=>{
		if(errr) res.status(400).send(errr);
		res.send(ress)
	})
 })

 app.listen(port,()=>{
 	console.log(`Server running at port ${port}...`);
 })

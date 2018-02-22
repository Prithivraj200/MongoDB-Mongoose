const mongoose=require("mongoose");
const validator=require('validator');
const jwt = require('jsonwebtoken');
const _=require('lodash');
const bcrypt=require('bcryptjs');

var profile=mongoose.model('Profile',{
    name:{
      type:String,
      required:true,
      trim:true
    },
    age:{
    	type:Number,
    	default:24
    },
    completedAt:{
    	type:Number,
    	default:12
    },
    _creator:{
       type:mongoose.Schema.Types.ObjectId,
       required:true
    }
})

var UserSchema=new mongoose.Schema({
           email:{
             type:String,
             required:true,
             trim:true,
             unique:true,
             validate:{
                validator:validator.isEmail,
                message:'{Value} is not valid email'
             }
           },
           password:{
             type:String,
             required:true,
             minlength:6
           },
           tokens:[{
             access:{
                type:String,
                required:true
             },
             token:{
                type:String,
                required:true
              }
           }]
          })


UserSchema.methods.toJSON = function(){
  var user=this;
  var userObj=user.toObject();
  return _.pick(userObj,['_id','email'])
}



UserSchema.methods.generateAuthToken = function(){
  var user = this;
  var access='auth';
  var token=jwt.sign({_id:user._id.toHexString(),access},'node').toString();

  user.tokens=user.tokens.concat([{access,token}]);

  return user.save().then(()=>{
     return token;
  })
}

UserSchema.methods.removeToken=function(token){
  var user=this;
  return user.update({
      $pull:{
        tokens:{token}
      }
  })
}

UserSchema.statics.findByToken = function(token){
   var User=this;
   var decoded;
   try{
     decoded=jwt.verify(token,'node');
   }
   catch(e){
     return Promise.reject();
   }
   
   return User.findOne({
      '_id':decoded._id,
      'tokens.access':'auth',
      'tokens.token':token
   })
}

UserSchema.statics.findByCredentials=function(body){
    var User=this;
    return User.findOne({email:body.email}).then((user)=>{
        if(!user) Promise.reject();
        return new Promise((resolve,reject)=>{
            bcrypt.compare(body.password,user.password,(err,res)=>{
               if(res) resolve(user)
               else reject()
            })
        })
    })
}

UserSchema.pre('save',function(next){
  var user=this;
  if(user.isModified('password')){
       bcrypt.genSalt(10,(err,salt)=>{
          bcrypt.hash(user.password,salt,(err,hash)=>{
             user.password=hash;
             next();
          })
       })
  }
  else{
     next();
  }
})

var User=mongoose.model('User',UserSchema);

module.exports={
	profile,
  User
}
const {mongoose}=require('./../server/db/jdbc');
const {profile}=require('./../server/models/Profile');

var id="5a85805aa24a8f3e2b6d7290";

profile.find({
	_id:id
}).then((data)=>{
	console.log(data)
})
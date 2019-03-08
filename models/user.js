var mongoose=require("mongoose"),
  passportLocalMongoose=require("passport-local-mongoose");
  
var userSchema=new mongoose.Schema({
    username:String,
    password:String,
    firstName:String,
    lastName:String,
    profileUrl:String,
    
    freeTime:{
        from:Date,
        to:Date
    }
});
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);
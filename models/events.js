var mongoose=require("mongoose");
var eventsSchema=new mongoose.Schema({
    title:String,
    desc:String,
    url:String,
    authors:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
            },
        username:String
    },
    phone:String,
    sTime:Date,
    eTime:Date,
    place:String
});
module.exports=mongoose.model("event",eventsSchema);
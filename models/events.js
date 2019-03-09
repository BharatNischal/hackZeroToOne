var mongoose=require("mongoose");
var eventsSchema=new mongoose.Schema({
    title:String,
    desc:String,
    url:String,
    freeTime:{
        from:Date,
        to:Date
    },
    phone:String,
    place:String
});
module.exports=mongoose.model("event",eventsSchema);
var mongoose=require("mongoose");
var eventsSchema=new mongoose.Schema({
    eventName:String,
    eventDesc:String,
    eventImg:String,
    authors:[{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
            },
        username:String
    }]

});
module.exports=mongoose.model("event",eventsSchema);
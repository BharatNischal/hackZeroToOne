var mongoose=require("mongoose");
var interestSchema=new mongoose.Schema({
    category:String,
    
    users:[{
        id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
        },
        username:String
    }]
});

module.exports=mongoose.model("interest",interestSchema);
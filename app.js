var   express = require("express"),
          app = express(),
   bodyparser = require("body-parser"),
   passport=require("passport"),
   localStrategy=require("passport-local"),
   passportLocalMongoose=require("passport-local-mongoose"),
   User = require("./models/user.js"),
   Interests=require("./models/interests.js"),
     mongoose = require("mongoose"),
     Interest=require("./models/interests.js");

mongoose.connect("mongodb://localhost/appdb",{useNewUrlParser:true});
// var interests=["Cricket","outdoor Sports","indoor sports","Art","IOT","AI and ML","Photography","Gaming","Economics","National Issues","Quizzing"];
// var interestObject;
// interests.forEach(function(interest){
//    interestObject={category:interest};
//    Interest.create(interestObject,function(err,interest){
//         if(err){
//             console.log(err);
//         }
//         else{
//             console.log(interest);
//         }
//    }); 
// });
app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");

app.use(require("express-session")({
    secret:"Dogs are cute",
    resave:false,
    saveUninitialized:false
}));

app.use(express.static(__dirname+"/public"));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 
app.use(function(req,res,next){
    res.locals.curUser=req.user;
    next();
});
  
app.get("/",function(req,res){
    res.render("home.ejs");
});

//Auth Routes 
app.get("/login",function(req,res){
    res.render("login");
})
app.get("/register",function(req,res){
    res.send("register page");
});
app.post("/register",function(req, res) {
    User.register(new User({username: req.body.username,firstName:req.body.firstname,lastName:req.body.lastname,profileUrl:req.body.profile}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            req.flash("error",err.message);
            return res.redirect("/");
        }
        passport.authenticate("local")(req,res,function(){
           
            res.redirect("/");
        });
        console.log(user);
    });
});
app.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/" 
}), function(req,res){

});
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});

//Common Interest========================================
app.get("/findmatch/",function(req,res){
    Interest.find({},function(err,interests){
        if(err){
            console.log(err);
        }
        else{
            res.render("interest",{interests:interests});
        }
    });
    
});
app.post("/findmatch",function(req,res){
    User.findById(req.user._id,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/");
        }
        else{
            var fd=new Date();
            var hr=Number(req.body.fTime.split(":")[0]);
            var min=Number(req.body.fTime.split(":")[1]);
            console.log(hr," : ",min);
            fd=new Date(fd.getFullYear(),fd.getMonth(),fd.getDay(),hr,min);
            
            var ed=new Date();
             hr=Number(req.body.eTime.split(":")[0]);
             min=Number(req.body.eTime.split(":")[1]);
            console.log("End ",hr," : ",min);
            ed=new Date(ed.getFullYear(),ed.getMonth(),ed.getDay(),hr,min);
            user.freeTime.from=fd;
            user.freeTime.to=ed;
            user.save();
            
           
            
            
        }
    });
    var userObj={
        id:req.user._id,
        username:req.user.username
    };
    Interest.findOne({category:req.body.category},function(err,interest){
        if(err){
            console.log(err);
            
        }else{
            console.log(interest);
            interest.users.push(userObj);
            interest.save();
        }
        res.redirect("/")
    });
});


app.listen(8000,function(){
    console.log("app is running!!");
});
var   express = require("express"),
          app = express(),
   bodyparser = require("body-parser"),
   passport=require("passport"),
   localStrategy=require("passport-local"),
   passportLocalMongoose=require("passport-local-mongoose"),
   User = require("./models/user.js"),
   Event = require("./models/events.js"),
   Interests=require("./models/interests.js"),
     mongoose = require("mongoose"),
     Interest=require("./models/interests.js");
     
     var socket = require('socket.io');
     var chatGroups=require("./models/chatGroups");

     var nodemailer = require('nodemailer');

     // Create the transporter with the required configuration for Gmail
     // change the user and pass !
     var transporter = nodemailer.createTransport({
         host: 'smtp.gmail.com',
         port: 465,
         secure: true, // use SSL
         auth: {
             user: 'manjotsingh16july@gmail.com',
             pass: 'corei3inside'
         }
     });
     
     // setup e-mail data
     var mailOptions = {
         from: '"Our Code World " <manjotsingh16july@gmail.com>', // sender address (who sends)
         to: 'nischalbharat4819@gmail.com', // list of receivers (who receives)
         subject: 'Hello', // Subject line
         text: 'Hello world ', // plaintext body
        
     };

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
    res.locals.currentUser=req.user;
    next();
});
  
var socketUsers = [];

var server=app.listen(8000,function(){
    console.log("app is running!!");
});
// Socket setup & pass server
var io = socket(server);
io.on('connection', function(socket){
    console.log("socket connected",socket.id);
    socket.on('chat',function (data) {
      var index = data.indexOf(" ");
      var groupId = data.substring(0,index);
      console.log("groupId:",groupId);
      var msg = data.substr(index+1);
      console.log("message is:",msg);
      chatGroups.findById(groupId,function (err, group) {
        group.members.forEach(function (name) {
          var i = socketUsers.findIndex(function (e) {
            return e.name === name;
          });
          socketUsers[i].socket.emit('chat',msg);
        });
      });
    });
    socket.on('new_user',function (data) {
      console.log("new user called");
      socketUsers.push({name:data,socket:socket});
      console.log("user list after new user is added",socketUsers);
    })
});

io.sockets.on('connection', function(socket) {
   socket.on('disconnect', function() {
      console.log('Got disconnect!');
      console.log(socket.id);
      var temp = socketUsers.filter(function(e){
        return e.socket!== socket;
      });
      socketUsers = temp;
    });
});



app.get("/",function(req,res){
    res.render("home",{currentUser:req.user});
});

//Auth Routes 
app.get("/login",function(req,res){
    res.render("login",{currentUser:req.user});
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

app.get('/createEvent',function(req, res){
    res.render('createEvent');
});

app.post('/createEvent',function(req, res){
    var freeTime = {from:null,to:null};
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
            freeTime.from=fd;
            freeTime.to=ed;
    var eventObj = {tittle:req.body.title,desc:req.body.description,url:req.body.url,phone:req.body.phone,place:req.body.place,freeTime:freeTime}
    Event.create(eventObj,function(err, event){
        res.redirect('/');
    });
});

app.get('/showEvent',function(req,res){
    Event.find({},function(err,foundEvents){
        if(err){
            console.log(err);
            res.redirect('/');
        }
        res.render("allEvents",{foundEvents:foundEvents});
    });
});

//Common Interest========================================
app.get("/findmatch/",function(req,res){
    Interest.find({},function(err,interests){
        if(err){
            console.log(err);
        }
        else{
            res.render("interest",{interests:interests,currentUser:req.user});
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
            var i = interest.users.findIndex(function(e){
                return e.username == req.user.username;
            });
            if(i === -1){
                interest.users.push(userObj);
            }
            interest.save();
        }
        
    });
    res.redirect("/findmatch/"+req.body.category);
});
app.get("/findmatch/:cat",function(req,res){
    var availUser=[];
    var temp = false;
    // var user1=[];
    // var user2=[];
    // Interest.findOne({category:req.params.cat},function(err,interest){
    //     if(err){
    //         console.log(err);
    //         res.redirect("/");
    //     }
    //     else{
    //         console.log(interest.users);
    //         user1=interest.users;

    //     }
    // });
    // User.find({},function(err,foundUser){
    //     if(err){
    //         console.log(err);
    //         res.redirect("/");
    //     }
    //     else{
    //         foundUser.forEach(function(user){
    //             if(!foundUser._id.equals(req.user._id)){
                        
                    
    //                 if(((foundUser.freeTime.from.getTime()<=req.user.freeTime.from.getTime()) && (foundUser.freeTime.to.getTime()>=req.user.freeTime.to.getTime())) || ((foundUser.freeTime.from.getTime()>req.user.freeTime.from.getTime()) && (foundUser.freeTime.to.getTime()<req.user.freeTime.to.getTime())) ){
    //                             user2.push(user);   
    //                     }
    //                 }

    //         });
    //         test1();
    //     }
    // });
    // var test1=function(){
    //     console.log("user1: ",user1);
    // console.log("user2:",user2);
    // user2.forEach(function(user){
    //     var i=user1.findIndex(function(e){
    //         return e.id.equals(user._id);
    //     });
    //     if(i!=-1){
    //         availUser.push(user);
    //     }
    // });
    // console.log("Avail User: ",availUser);
    // res.render("foundUsers",{currentUser:req.user,foundUsers:availUser,interest:req.params.cat});
    // }
       Interest.findOne({category:req.params.cat},function(err,interest){
        if(err){
            console.log(err);
            res.redirect("/");
        }
        else{
            
            if(interest){
            interest.users.forEach(function(user,i){

                User.findById(user.id, function(err,foundUser){
                    if(err){
                        console.log(err);
                    }else{
                       
                    if(!foundUser._id.equals(req.user._id)){
                        
                    
                        if(((foundUser.freeTime.from.getTime()<=req.user.freeTime.from.getTime()) && (foundUser.freeTime.to.getTime()>=req.user.freeTime.to.getTime())) || ((foundUser.freeTime.from.getTime()>req.user.freeTime.from.getTime()) && (foundUser.freeTime.to.getTime()<req.user.freeTime.to.getTime())) ){
                                 availUser.push(foundUser);   
                                  console.log(foundUser);  
                                  
                                         
                        }
                          
                    }
                    if(i === interest.users.length-1){
                        console.log(availUser);
                        
                        res.render("foundUsers",{currentUser:req.user,foundUsers:availUser,interest:req.params.cat});
                      } 
                }
                });
            

            });
        }

            
        }
    });
    
    
});

//==================req route=======================
app.get("/sendreq/:id1/:id2",function(req,res){
    User.findById(req.params.id2,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/");
        }
        else{
            var mailOptions = {
                from: '"Our Code World " <manjotsingh16july@gmail.com>', // sender address (who sends)
                to: user.username, // list of receivers (who receives)
                subject: 'Invitation link to chat', // Subject line
                text: 'Dear user you have recieved a request to join chat by ' + req.user.firstName+" "+req.user.lastName+".  Click the link below to join the chat room /n http://localhost:8000" +"/chat/"+req.params.id1+"/"+req.params.id2    // plaintext body
               
            };
             // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
            
                console.log('Message sent: ' + info.response);
            });

        }
        
        
    });
    
    
   
    
    console.log("/chat/"+req.params.id1+"/"+req.params.id2);
    res.redirect("/");
});
//==================================SOCKET ROUTES=============================
app.get('/chat/:id1/:id2',function (req, res) {
    chatGroups.create({members:[]},function (err, grp) {
      grp.members.push(req.user.username);
      grp.save();
      User.findById(req.params.id1,function(err,user){
        if(err){

            console.log(err);
            res.redirect("/");
        }
        else{
            var mailOptions = {
                from: '"Our Code World " <manjotsingh16july@gmail.com>', // sender address (who sends)
                to: user.username, // list of receivers (who receives)
                subject: 'Your request accepted', // Subject line
                text: 'Dear user,  ' + req.user.firstName+" "+req.user.lastName+" has accepted your request click the link to begin the chat http://localhost:8000" +"/chat/"+grp._id    // plaintext body
               
            };
             // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                } 
            
                console.log('Message sent: ' + info.response);
            });  
        
              res.redirect('/chatting/'+grp._id);
           
        
        }
    });
    });  

   
});



app.get('/chat/:groupId/',function (req, res) {
  // we will get the name of semder from req.user but here we are giving it manually
  chatGroups.findById(req.params.groupId,function (err, grp) {
    grp.members.push(req.user.username);
    grp.save();
    res.redirect('/chatting/'+grp._id);
  });
});


  app.get('/chatting/:groupId',function (req, res) {
      console.log("users in user array are",socketUsers);
      res.render('index',{groupId:req.params.groupId,username:req.user.username});
    });


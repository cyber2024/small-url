var express = require("express");
var app = express();
var mongoose = require("mongoose");
var validUrl = require('valid-url');
var links = 0;

var urlSchema = new mongoose.Schema({
    url: String,
    short_url:String
});
var smallUrl = mongoose.model('urlSchema',urlSchema);

mongoose.connect("mongodb://small:small@ds013946.mlab.com:13946/smallurl");

mongoose.connection.on('connected', function(){
    console.log('connected to database.')
    smallUrl.find({}, function(err, data){
        if(err)
            console.log(err);
        if(data)
            links = data.length;
    });
});
mongoose.connection.on('disconnected', function(){
    console.log('disconnected from database.')
    });
mongoose.connection.on('error', function(err){
    console.log('database error',err);
});

app.get('/', function(req,res){
   res.send('home'); 
});

app.get('/:protocol//:host', function(req,res){
    var url=req.path.split('').splice(1,req.path.length-1).join('');
  
    if (validUrl.isUri(url)){
        console.log('Looks like an URL');
        smallUrl.findOne({url:url}, function(err, data){
          if(err){
              res.send(err);
              return;
          } else if(data){
              res.json(data);
          } else {
              var link = new smallUrl();
              link.url = url;
              link.short_url = links;
              links++;
              link.save(function(err){
                  if(err) console.log(err);
                res.json({url:link.url, short_url:link.short_url});
              });
          }
        });
    } else {
        
        console.log('Not a URL');
    }
    
});

app.get('/:code',function(req,res){
    var url = req.params.code;
   smallUrl.findOne({short_url:url}, function(err, data){
           if(err){
               console.log(err);
                res.send(err);   
           } else if(data) {
               res.redirect(data.url);
           }
    }); 
});

app.listen(8080, console.log("listening on 8080"));

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
    console.log('full url');
    if(/https?:/.test(req.params.protocol)){
        console.log('protocol works');
        var url=req.path.split('').splice(1,req.path.length-1).join('');
        console.log(url);
      
        if (validUrl.isUri(url)){
            console.log('Looks like an URL');
            smallUrl.findOne({url:url}, function(err, data){
              if(err){
                  res.send(err);
                  return;
              } else if(data){
                  res.json({url:data.url, short_url:data.short_url});
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
            
            res.json({error:'url invalid'});
        }
    } else {
        res.json({error:'protocol invalid'});
    }
    
    
});

app.get('/:code',function(req,res){
    console.log('short url');
    var url = req.params.code;
       smallUrl.findOne({short_url:url}, function(err, data){
               if(err){
                   console.log(err);
                    res.send(err);   
               } else if(data) {
                   res.redirect(data.url);
               } else {
                   res.json({error:"url invalid"});
               }
        }); 
});

var port = process.env.PORT || 8080;

app.listen(port, console.log("listening on %d",port));

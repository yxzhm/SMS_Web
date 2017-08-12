var express = require('express');
var router = express.Router();
var dblite = require('dblite').withSQLite('3.8.6+');
var fs = require('fs');
var md5=require('crypto');
var auth_model=require('./model/auth_model');

var db;
var authList={};

/* GET users listing. */
router.post('/auth', function(req, res, next) {
    console.log("auth");
    var phone = req.body.phone;
    var password = req.body.password;
    if(phone!=undefined && password!=undefined) {
        var db = get_db();
        db.query('.databases');
        db.query("select * from user where phone = '"+phone+"'",function (err, rows) {
            if(rows.length==1){
                var pass_from_db = rows[0][1];
                if(pass_from_db==password){
                    var new_auth=new auth_model();
                    new_auth.create_auth(phone);
                    authList.add(new_auth);
                    res.send(new_auth.uuid);
                }
            }

        });

    }
});

router.post('/sms', function (req,res,next) {
    var uuid = req.body.uuid;
    var content = req.body.content;
    var contact=req.body.contact;



    res.send("Post sms");
});

router.get('/sms',function (req, res, next) {
   res.send("Get sms");
});

var get_phone_by_uuid=function(uuid){
    var temp={};
    for(var i=0;i<authList.length;i++){
        var auth=authList[i];
        var current = new Date();

        if(current.getTime()-auth.time.getTime()<1000*60*30){
            temp.add(auth);
        }
    }

    authList=temp;
    for(var i=0;i<authList.length;i++){
        var auth=authList[i];
        if(auth.uuid==uuid){
            return auth.phone;
        }
    }
    return undefined;
};

var get_md5=function (content) {
    var md5=crypto.createHash('md5');
    return md5.update(content).digest('base64');
};


var get_db = function(){
    if(db==undefined) {
        if (fs.existsSync('/db/sms.db')) {
            db = dblite('/db/sms.db');
            console.log("Production DB: /db/sms.db");
        }
        else {
            if (fs.existsSync('./db/sms.db')) {
                console.log("Debug DB: ./db/sms.db");
            }
            db = dblite('./db/sms.db');
        }
    }
    return db;

};


module.exports = router;

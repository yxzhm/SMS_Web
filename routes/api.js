var express = require('express');
var router = express.Router();
var dblite = require('dblite').withSQLite('3.8.6+');
var fs = require('fs');


/* GET users listing. */
router.post('/auth', function(req, res, next) {
    var phone = req.body.phone;
    var password = req.body.password;
    if(phone!=undefined && password!=undefined) {
        var db = get_db();
        db.query('.databases');
        db.query("select * from user where phone = '"+phone+"'",function (err, rows) {
            res.send('Post Auth');
        });

    }
});

router.post('/sms', function (req,res,next) {
    res.send("Post sms");
});

router.get('/sms',function (req, res, next) {
   res.send("Get sms");
});

var db;
var get_db = function(){
    if(db==undefined) {
        if (fs.existsSync('/db/sms.db')) {
            db = dblite('/db/sms.db');
        }
        else {
            if (fs.existsSync('./db/sms.db')) {
                console.log("db exists");
            }
            db = dblite('./db/sms.db');
        }
    }
    return db;

};


module.exports = router;

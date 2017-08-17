var express = require('express');
var router = express.Router();
var dblite = require('dblite').withSQLite('3.8.6+');
var fs = require('fs');
var crypto = require('crypto');
var format = require('string-format');
var events = require('events');

var auth_model = require('./model/auth_model');
var utlity= require('./sms_util');



/* GET users listing. */
router.post('/auth', function (req, res, next) {
    console.log("auth");
    var phone = req.body.phone;
    var password = req.body.password;
    if (phone != undefined && password != undefined) {
        init();

        var db = global.db;
        db.query('.databases');
        db.query("select * from user where phone = '" + phone + "'", function (err, rows) {
            if (rows.length == 1) {
                var pass_from_db = rows[0][1];
                if (pass_from_db == password) {
                    console.log('login success.');
                    var new_auth = new auth_model();
                    new_auth.create_auth(phone);
                    global.authList.push(new_auth);
                    res.send(new_auth.uuid);
                }
            }else{
                console.log("login fail");
                res.send('');
            }

        });

    }
});

var init = function () {
    if (global.db == undefined) {
        if (fs.existsSync('/db/sms.db')) {
            global.db = dblite('/db/sms.db');
            console.log("Production DB: /db/sms.db");
        }
        else {
            if (fs.existsSync('./db/sms.db')) {
                console.log("Debug DB: ./db/sms.db");
            }
            global.db = dblite('./db/sms.db');
        }
    }

    if(global.authList==undefined) {
        global.authList = new Array();
    }
    if(global.emitter==undefined) {
        global.emitter = new events.EventEmitter();
    }


};

router.post('/sms', function (req, res, next) {
    var uuid = req.body.uuid;
    var content = req.body.content;
    var contact = req.body.contact;
    var time = req.body.time;
    var util = new utlity();
    var phone = util.get_phone_by_uuid(uuid);

    if (phone != undefined && content != undefined && contact != undefined && time != undefined) {
        init();
        var id = util.get_md5(phone + contact + content + time);
        util.get_sms_by_phone(phone, 'post_sms');

        global.emitter.on("post_sms" + phone, function (smsList) {
            if (!util.sms_exist(id, smsList)) {
                var sql = "insert into sms (id, phone, content, contact_phone, flag, time) values ('" + id + "'," + phone + ",'" + content + "'," + contact + ",'Received','" + time + "')";
                var db = global.db;
                db.query(sql, function (err, rows) {
                    if (err == undefined) {
                        console.log("inserted " + sql);
                        res.send("posted");
                    }
                });
            }
        });


    }

});

router.get('/sms', function (req, res, next) {
    if(req.query!=undefined && req.query.uuid!=undefined) {
        init();
        var uuid = req.query.uuid;

        var util = new utlity();
        var phone = util.get_phone_by_uuid(uuid);
        if(phone!=undefined) {
            util.get_sms_by_phone(phone, "get_sms");
            global.emitter.on("get_sms" + phone, function (smsList) {
                res.send(smsList);
            });
        }

    }
});






module.exports = router;


var express = require('express');
var router = express.Router();
var dblite = require('dblite').withSQLite('3.8.6+');
var fs = require('fs');
var crypto = require('crypto');
var format = require('string-format');
var events = require('events');

var auth_model = require('./model/auth_model');
var sms_model = require('./model/sms_model');
var db;
var authList = new Array();
var emitter = new events.EventEmitter();

/* GET users listing. */
router.post('/auth', function (req, res, next) {
    console.log("auth");
    var phone = req.body.phone;
    var password = req.body.password;
    if (phone != undefined && password != undefined) {
        var db = get_db();
        db.query('.databases');
        db.query("select * from user where phone = '" + phone + "'", function (err, rows) {
            if (rows.length == 1) {
                var pass_from_db = rows[0][1];
                if (pass_from_db == password) {
                    var new_auth = new auth_model();
                    new_auth.create_auth(phone);
                    authList.push(new_auth);
                    res.send(new_auth.uuid);
                }
            }

        });

    }
});

router.post('/sms', function (req, res, next) {
    var uuid = req.body.uuid;
    var content = req.body.content;
    var contact = req.body.contact;
    var time = req.body.time;

    var phone = get_phone_by_uuid(uuid);

    if (phone != undefined && content != undefined && contact != undefined && time != undefined) {
        var id = get_md5(phone + contact + content + time);
        get_sms_by_phone(phone, 'post_sms');

        emitter.on("post_sms" + phone, function (smsList) {
            if (!sms_exist(id, smsList)) {
                var sql = "insert into sms (id, phone, content, contact_phone, flag, time) values ('" + id + "'," + phone + ",'" + content + "'," + contact + ",'Received','" + time + "')";
                var db = get_db();
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
        var uuid = req.query.uuid;
        var phone = get_phone_by_uuid(uuid);
        get_sms_by_phone(phone,"get_sms");
        emitter.on("get_sms"+phone,function (smsList) {
            res.send(smsList);
        });

    }
});

var sms_exist = function (id, smsList) {
    if (id == undefined)
        return false;
    if (smsList == undefined)
        return false;

    var result = false;
    for (var i = 0; i < smsList.length; i++) {
        if (smsList[i].id == id) {
            result = true;
            break;
        }
    }

    return result;
};

var get_sms_by_phone = function (phone, event_flag) {
    var db = get_db();
    var sql = "select * from sms where phone=" + phone+" order by time";
    var smsList = new Array();
    db.query(sql, function (err, rows) {
        for (var i = 0; i < rows.length; i++) {
            var sms = new sms_model();
            sms.id = rows[i][0];
            sms.phone = rows[i][1];
            sms.content = rows[i][2];
            sms.contact_phone = rows[i][3];
            sms.flag = rows[i][4];
            sms.time = rows[i][5];
            smsList.push(sms);
        }
        emitter.emit(event_flag + phone, smsList);
        // return smsList;
    });
};

var get_phone_by_uuid = function (uuid) {
    var temp = new Array();
    for (var i = 0; i < authList.length; i++) {
        var auth = authList[i];
        var current = new Date();

        if (current.getTime() - auth.time.getTime() < 1000 * 60 * 30) {
            temp.push(auth);
        }
    }

    authList = temp;
    for (var i = 0; i < authList.length; i++) {
        var auth = authList[i];
        if (auth.uuid == uuid) {
            return auth.phone;
        }
    }
    return undefined;
};

var get_md5 = function (content) {
    var md5 = crypto.createHash('md5');
    return md5.update(content).digest('base64');
};


var get_db = function () {
    if (db == undefined) {
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

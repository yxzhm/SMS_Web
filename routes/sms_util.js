
var dblite = require('dblite').withSQLite('3.8.6+');
var fs = require('fs');
var crypto = require('crypto');
var format = require('string-format');
var events = require('events');
var auth_model = require('./model/auth_model');
var sms_model = require('./model/sms_model');

function sms_util() {


};


sms_util.prototype.sms_exist = function (id, smsList) {
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

sms_util.prototype.get_sms_by_phone = function (phone, event_flag) {
    var db = global.db;
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
        global.emitter.emit(event_flag + phone, smsList);
        // return smsList;
    });
};

sms_util.prototype.get_phone_by_uuid = function (uuid) {
    var temp = new Array();
    for (var i = 0; i < global.authList.length; i++) {
        var auth = global.authList[i];
        var current = new Date();

        if (current.getTime() - auth.time.getTime() < 1000 * 60 * 30) {
            temp.push(auth);
        }
    }

    global.authList = temp;
    for (var i = 0; i < global.authList.length; i++) {
        var auth = global.authList[i];
        if (auth.uuid == uuid) {
            auth.time=new Date();
            return auth.phone;
        }
    }
    return undefined;
};

sms_util.prototype.get_md5 = function (content) {
    var md5 = crypto.createHash('md5');
    return md5.update(content).digest('base64');
};

module.exports = sms_util;
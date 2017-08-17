/**
 * Created by ncs on 17-8-16.
 */
var express = require('express');
var router = express.Router();
var utlity= require('./sms_util');
/* GET users listing. */

router.get('/', function (req, res, next) {
    if(req.query!=undefined && req.query.uuid!=undefined) {
        var util = new utlity();
        var phone = util.get_phone_by_uuid(req.query.uuid);
        if(phone!=undefined) {
            util.get_sms_by_phone(phone, "get_sms");
            global.emitter.on("get_sms" + phone, function (smsList) {
                res.render('sms', { smslist: smsList });
            });
        }
    }
});

module.exports = router;

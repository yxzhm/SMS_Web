/**
 * Created by ncs on 17-8-16.
 */
var express = require('express');
var router = express.Router();
/* GET users listing. */

router.get('/sms', function (req, res, next) {
    if(req.query!=undefined && req.query.uuid!=undefined) {
        res.send(req.query.uuid);

    }
});

module.exports = router;

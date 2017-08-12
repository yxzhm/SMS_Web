
var uuid = require('node-uuid');

function auth_model() {
    var uuid;
    var phone;
    var time;


};

auth_model.prototype.create_auth=function (phone_num) {
   this.phone=phone_num;
    this.uuid =uuid.v1();
    this.time = new Date();
};

module.exports = auth_model;
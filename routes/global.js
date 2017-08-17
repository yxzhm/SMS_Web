/**
 * Created by ncs on 17-8-17.
 */

var events = require('events');

global.emitter = new events.EventEmitter();
global.authList = new Array();

global.db;



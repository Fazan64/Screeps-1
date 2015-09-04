var PROFILER_REPORT_INTERVAL = 20;

var profiler = require ('profiler');

var performRoles = require ('performRoles');
var spawner = require ('spawner');
var roomManager = require ('roomManager');
var ProtoRole = require ('role_prototype');

profiler.wrap (spawner.prototype);
//profiler.wrap (RoomManager.prototype);

profiler.wrap (ProtoRole.prototype);

for (var i in Game.rooms)
{
	roomManager.reset ();
	roomManager.setRoom (Game.rooms [i]);
	
	roomManager.initMemory ();
	roomManager.updateNeeds ();
}

for (var i in Game.spawns)
{
	spawner (Game.spawns [i]);
}

performRoles (Game.creeps);

if (Game.time % PROFILER_REPORT_INTERVAL == 0)
{
	console.log ("---------------------------------------------------------");
	profiler.report ();
	console.log ("---------------------------------------------------------");
}

console.log ("Total used cpu: " + Game.getUsedCpu () + " / " + Game.cpuLimit);
console.log ();
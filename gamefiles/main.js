var ENABLE_PROFILING = true;
var PROFILER_REPORT_INTERVAL = 20;

var profiler = require ('profiler');

if (ENABLE_PROFILING) 
{
    profiler.wrap (globals, 'require');
}

var performRoles = require ('performRoles');
var spawner = require ('spawner');
var roomManager = require ('roomManager');
var ProtoRole = require ('role_prototype');

if (ENABLE_PROFILING) 
{
	profiler.wrap (RoomPosition.prototype, 'findPathTo');
    profiler.wrap (RoomPosition.prototype, 'findClosest');
    
    profiler.wrap (Game, 'getObjectById');
	
	profiler.wrap (spawner);
	
	profiler.wrap (RoomManager.prototype, 'updateNeeds');
}

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
	Memory.profilerDump = Memory.profilerDump || {};
	Memory.profilerDump [Game.time] = profiler.getData ();
}

console.log ("Total used cpu: " + profiler.getUsedCpu () + " / " + Game.cpuLimit);
console.log ();


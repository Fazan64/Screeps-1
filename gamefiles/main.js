var ENABLE_PROFILING = true;
var PROFILER_REPORT_INTERVAL = 20;

console.log ("New 'globals' object created!");

var profiler = require ('profiler');

if (ENABLE_PROFILING) 
{
	profiler.wrap (profiler, 'wrap');
	profiler.wrap (console, 'log');
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
	
	profiler.wrap (roomManager, 'updateNeeds');
	
	profiler.wrap (ProtoRole.prototype, 'reset');
	profiler.wrap (ProtoRole.prototype, 'moveTo');
	profiler.wrap (ProtoRole.prototype, 'getRangedTarget');
	
	spawner = profiler.wrap (spawner);
}

function loop ()
{	
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
	
	if (ENABLE_PROFILING && Game.time % PROFILER_REPORT_INTERVAL == 0)
	{
		Memory.profilerDump = Memory.profilerDump || {};
		
		var report = profiler.report ();
		
		profiler.logReport (report);
		Memory.profilerDump [Game.time] = report;
	}
	
	console.log ("Total used cpu: " + profiler.getUsedCpu ().toFixed (2) + " / " + Game.cpuLimit);
	console.log ();
}

module.exports.loop = ENABLE_PROFILING ? profiler.wrapAsMainLoop (loop) : loop;
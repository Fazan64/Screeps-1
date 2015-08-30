var Stopwatch = require ('stopwatch');

var performRoles = require ('performRoles');
var spawner = require ('spawner');
var RoomManager = require ('roomManager');

var stopwatch = new Stopwatch ();

stopwatch.restart ();
for (var i in Game.rooms)
{
	var roomManager = new RoomManager (Game.rooms [i]);
	roomManager.initMemory ();
	roomManager.updateNeeds ();
}
console.log ("RoomManagers: " + stopwatch.usedCpu + " cpu");

stopwatch.restart ();
for (var i in Game.spawns)
{
	spawner (Game.spawns [i]);
}
console.log ("Spawners: " + stopwatch.usedCpu + " cpu");

stopwatch.restart ();
performRoles (Game.creeps);
console.log ("Creep roles: " + stopwatch.usedCpu + " cpu");

console.log ("Total used cpu: " + Game.getUsedCpu () + " / " + Game.cpuLimit);
console.log ("-------------------------------------------------------");
var performRoles = require('performRoles');
var spawner = require('spawner');
var RoomManger = require ('roomManager');

for (var i in Game.rooms)
{
	var roomManager = new RoomManger (Game.rooms [i]);
	roomManager.initMemory ();
	roomManager.updateNeeds ();
}

for (var i in Game.spawns)
{
	spawner (Game.spawns [i]);
}

performRoles (Game.creeps);

console.log ("Used cpu: " + Game.getUsedCpu () + " / " + Game.cpuLimit);
console.log ("-------------------------------------------------------");
var performRoles = require('performRoles');
var spawner = require('spawner');
var RoomManager = require ('roomManager');

for (var i in Game.rooms)
{
	var roomManager = new RoomManager (Game.rooms [i]);
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
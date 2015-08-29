var performRoles = require('performRoles');
var spawner = require('spawnerNew');
var room = require ('room');

for (var i in Game.rooms)
{
	room (Game.rooms [i]);
}

for (var i in Game.spawns)
{
	spawner (Game.spawns [i]);
}

performRoles (Game.creeps);

console.log ("Used cpu: " + Game.getUsedCpu () + " / " + Game.cpuLimit);
console.log ("-------------------------------------------------------");
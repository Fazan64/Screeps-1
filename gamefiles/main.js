var performRoles = require('performRoles');
var spawner = require('spawnerNew');
var countType = require('countType');
//var factory = require('factory');
var room = require ('room');

//factory.init();
//factory.run();

for (var i in Game.rooms)
{
	room (Game.rooms [i]);
}

for (var i in Game.spawns)
{
	spawner (Game.spawns [i]);
}

//factory.buildArmyWhileIdle();

performRoles (Game.creeps);
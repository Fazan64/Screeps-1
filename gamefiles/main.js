var performRoles = require('performRoles');
var spawner = require('spawner');
var countType = require('countType');
var factory = require('factory');
var room = require ('room');

factory.init();
factory.run();

for (var i in Game.rooms)
{
	room (Game.rooms [i]);
}

spawner.spawnNextInQue();

factory.buildArmyWhileIdle();

performRoles(Game.creeps);
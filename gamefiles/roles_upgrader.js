function isSpawn (structure) 
{ 
	return structure.type == STRUCTURE_SPAWN;
}

var ProtoRole = require ("role_prototype");

/**
 * @class
 * @constructor
 */
function Upgrader () { ProtoRole.apply (this, arguments) }

Upgrader.prototype = Object.create (ProtoRole.prototype);

Upgrader.prototype.baseParts = [WORK, CARRY];

Upgrader.prototype.onStart = function ()
{
	var creep = this.creep;
	
	creep.memory.id = creep.id;
	
	if (creep.room.controller)
	{
		creep.memory.controller = creep.room.controller.id;
	}
	
	// Since this is called when the creep is still being spawned so there is definitely a spawn at this creeps position
	var spawn = creep.room.lookForAt ('structure', creep.pos).filter (isSpawn) [0];
	// If something goes terribly wrong
	if (!spawn)
	{
		spawn = creep.room.mySpawns [0];
	}
	creep.memory.spawn = spawn.id;
	
	creep.room.memory.upgraders [creep.id] = 
	{
		upgradePerTick : creep.getActiveBodyparts (WORK) * 2
	}
	
	creep.room.memory.consumers [creep.id] = 
	{
		consumptionPerTick : creep.getActiveBodyparts (WORK) * 2
	}
}

Upgrader.prototype.onDeath = function (memory)
{
	var spawn = Game.getObjectById (memory.spawn);
	// We no longer upgrade a controller
	delete spawn.room.memory.upgraders [memory.id];
	// We no longer consume energy;
	delete spawn.room.memory.consumers [memory.id];
}

Upgrader.prototype.action = function ()
{
	var creep = this.creep;
	
	var controller = Game.getObjectById (creep.memory.controller);
	var spawn = Game.getObjectById (creep.memory.spawn);
	
	if (creep.room.underAttack)
	{
		if (creep.carry.energy > 0)
		{
			this.moveAndPerform (spawn, creep.transferEnergy);
		}
		else
		{
			this.keepAwayFromEnemies ();
		}
	}
	else
	{
		if (creep.carry.energy > 0)
		{
			this.moveAndPerform (controller, creep.upgradeController);
		}
		else
		{
			this.moveTo (spawn);
			spawn.transferEnergy (creep);
		}
	}
}

module.exports = Upgrader;
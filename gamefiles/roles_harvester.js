var ProtoRole = require ("role_prototype");

/**
 * These are simple creatures, they just find an active source and harvest it
 * @param creep
 * @class
 * @constructor
 */
function Harvester () { ProtoRole.apply (this, arguments) }

Harvester.prototype = Object.create (ProtoRole.prototype);

Harvester.prototype.baseParts = [WORK, CARRY];

Harvester.prototype.onStart = function ()
{
	var creep = this.creep;
	
	creep.memory.id = creep.id;
	
	var source = this.getClosest (FIND_SOURCES_ACTIVE);
	var spawn = source.pos.findClosestByRange (FIND_MY_SPAWNS);
	
	creep.memory.source = source.id;
	creep.memory.spawn = spawn.id;
	
	spawn.room.memory.suppliers [creep.id] = 
	{
		supplyPerTick : creep.getActiveBodyparts (WORK) * 2
	}
	
}

Harvester.prototype.onDeath (memory)
{
	// We no longer supply the room with energy
	var spawn = Game.getObjectById (memory.spawn);
	delete spawn.room.memory.suppliers [memory.id];
}

Harvester.prototype.action = function()
{
	var creep = this.creep;

	if (creep.carry.energy < creep.carryCapacity)
	{
		var source = this.getClosest (FIND_SOURCES_ACTIVE);
		if (source)
		{
			this.moveAndPerform (source, creep.harvest);
		}
	}
	else 
	{
		var target = this.getClosest (FIND_MY_SPAWNS);
		if (target)
		{
			if (creep.pos.isNearTo (target))
			{
				if (target.energy < target.energyCapacity)
				{
					creep.transferEnergy (target);
				}
				else
				{
					creep.dropEnergy ();
				}
			}
			else
			{
				creep.moveTo (target);
			}
		}
	}
}

module.exports = Harvester;
var ProtoRole = require ("role_prototype");

/**
 * Basically pickups dropped energy all around the place
 * @class
 * @constructor
 */
function Scavenger () { ProtoRole.apply (this, arguments) }

Scavenger.prototype = Object.create (ProtoRole.prototype);

Scavenger.prototype.baseParts = [CARRY, MOVE];

Scavenger.prototype.action = function ()
{
	var creep = this.creep;

	// Contains only those which weren't dropped by miners
	var droppedEnergy = this.getClosest (creep.room.droppedEnergy.filter (function (energyOrb) 
	{
		var creeps = energyOrb.pos.lookFor ('creep');
		for (var i in creeps)
		{
			// Make scavengers pickup only the energy which wasn't 
			// dropped by miners since that is miner_helpers job
			if (creeps [i].memory && creeps [i].memory.role == "miner")
			{
				return false;
			}
		}
		return true;
	}));

	if (droppedEnergy == null || creep.carry.energy == creep.carryCapacity)
	{
		var closestSpawn = this.getClosest (creep.room.mySpawns.filter (function (spawn)
		{
			return spawn.energy < spawn.energyCapacity;
		}));
		
		if (closestSpawn)
		{
			this.moveAndPerform (closestSpawn, creep.transferEnergy);
		}
	}
	else
	{
		this.moveAndPerform (droppedEnergy, creep.pickup);
	}
}

module.exports = Scavenger;
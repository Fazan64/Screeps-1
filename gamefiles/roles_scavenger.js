var ProtoRole = require ("role_prototype");

function EnergyOrbsFilter (energyOrb) 
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
}

/**
 * They basically pickup dropped energy all around the place. 
 * Also, they occasionaly try to scavenge the energy from the 
 * deceased enemies during the battle and act as decoys :) 
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
	var droppedEnergy = this.getClosest (creep.room.droppedEnergy.filter (EnergyOrbsFilter));

	if (creep.carry.energy == creep.carryCapacity)
	{
		var closestSpawn = this.getClosest (creep.room.mySpawns.filter (function (spawn)
		{
			return spawn.energy < spawn.energyCapacity;
		}));
		
		if (closestSpawn)
		{
			this.moveAndPerform (closestSpawn, creep.transferEnergy);
		}
		else
		{
			this.rest (true);
		}
	}
	else
	{
		if (droppedEnergy == null)
		{
			this.rest (true);
		}
		else
		{
			this.moveAndPerform (droppedEnergy, creep.pickup);
		}
	}
}

module.exports = Scavenger;
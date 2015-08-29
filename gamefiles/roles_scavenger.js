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

	var droppedEnergy = this.getClosest (FIND_DROPPED_ENERGY, {
		filter: function (en) 
		{
			var creeps = creep.room.lookForAt ('creep');
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
	});

	if (droppedEnergy == null || creep.energy == creep.energyCapacity)
	{
		var nearestSpawn = creep.pos.findNearest(Game.spawns, {
			filter: function (spawn)
			{
				return spawn.energy < spawn.energyCapacity;
			}
		});
		
		if (nearestSpawn)
		{
			this.moveAndPerform (nearestSpawn, creep.transferEnergy);
		}
	}
	else
	{
		this.moveAndPerform (droppedEnergy, creep.pickup);
	}
}

module.exports = Scavenger;
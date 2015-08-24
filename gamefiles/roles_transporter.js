/**
 * These transport energy from spawns to builders and extensions (in that order)
 */
var transporter = {
	
	baseParts : [CARRY, MOVE],

	action: function()
	{
		var creep = this.creep;

		//@TODO: Balance Spawns here

		if (creep.energy == 0)
		{
			var closestSpawn = this.getClosest (Game.spawns, {
				filter: function(spawn)
				{
					return spawn.energy > 0;
				}
			});

			creep.moveTo (closestSpawn);
			closestSpawn.transferEnergy (creep);

			return;
		}

		var target = null;

		// Transfer to builder
		if (!target) 
		{
			var builderToHelp = this.getClosest (Game.creeps, {
				filter: function (builder) 
				{
					return builder.memory.role == "builder"
						&& builder.energy < builder.energyCapacity - 10;
				}
			});

			if (builderToHelp)
			{
				target = builderToHelp;
			}
		}

		// Transfer to extensions
		if (!target)
		{
			var extension = this.getClosest (Game.structures, {
				filter: function (structure)
				{
					return structure.structureType == STRUCTURE_EXTENSION &&
						structure.energy < structure.energyCapacity;
				}
			});

			if (extension)
			{
				target = extension;
			}
		}

		//Go to target and give it energy
		if (creep.pos.isNearTo(target))
		{
			if (target.energy < target.energyCapacity) 
			{
				creep.transferEnergy(target);
			}
		}
		else 
		{
			creep.moveTo(target);
		}
	}
};

module.exports = transporter;
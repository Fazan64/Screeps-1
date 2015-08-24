/**
 * These are simple creatures, they just find an active source and harvest it
 * @param creep
 */
var harvester = 
{
	
	baseParts : [WORK, CARRY],

	action: function () 
	{
		var creep = this.creep;

		if (creep.energy < creep.energyCapacity)
		{
			var source = this.getClosest (FIND_SOURCES_ACTIVE);
			if (source)
			{
				this.moveAndPerform (source, creep.harvest);
			}
		}
		else 
		{
			var target = this.getClosest (Game.spawns);
			if (target)
			{
				this.moveAndPerform (target, creep.transferEnergy);
			}
		}
	}
};

module.exports = harvester;
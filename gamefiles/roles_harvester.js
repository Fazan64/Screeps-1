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
};

module.exports = harvester;
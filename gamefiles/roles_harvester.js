/**
 * These are simple creatures, they just find an active source and harvest it
 * @param creep
 */
var harvester = 
{
	
	baseParts : [WORK, CARRY],
	
	onStart: function ()
	{
		var creep = this.creep;
		
		creep.memory.id = creep.id;
		
		var source = this.getClosest (FIND_SOURCES_ACTIVE);
		var spawn = source.pos.findClosestByRange (FIND_MY_SPAWNS);
		
		creep.memory.source = source.id;
		creep.memory.spawn = spawn.id;
		
	},
	
	onDeath: function (memory)
	{
		// We no longer supply the room with energy
		var spawn = Game.getObjectById (memory.spawn);
		spawn.room.memory.suppliers [memory.id] = undefined;
	},

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
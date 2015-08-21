/**
 * These are simple creatures, they just find an active source and harvest it
 * @param creep
 */
var harvester = 
{
	
	baseParts : [WORK, CARRY],

	action: function () {
		var creep = this.creep;

		if(creep.energy < creep.energyCapacity) {
			var sources = creep.pos.findNearest(Game.SOURCES);
			creep.moveTo(sources);
			creep.harvest(sources);
		}
		else {
			var target = creep.pos.findNearest(Game.MY_SPAWNS);

			creep.moveTo(target);
			creep.transferEnergy(target);
		}
	}
};

module.exports = harvester;
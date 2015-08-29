var ProtoRole = require ("role_prototype");

/**
* @TODO: Make it more carry heavy, make it have helpers
* @type {{parts: *[], getParts: getParts, action: action}}
* @class
* @constructor
*/
function Builder () { ProtoRole.apply (this, arguments) }

Builder.prototype = Object.create (ProtoRole.prototype);
 
Builder.prototype.baseParts = [WORK, CARRY];

Builder.prototype.action = function()
{
	var creep = this.creep;

	//If out of energy, go to spawn and recharge
	if(creep.energy == 0) 
	{
		var closestSpawn = creep.pos.findClosestByRange(Game.spawns, {
			filter: function(spawn)
			{
				return spawn.energy > 0 && creep.pos.inRangeTo(spawn, 3);
			}
		});

		if (closestSpawn) 
		{
			creep.moveTo (closestSpawn);
			closestSpawn.transferEnergy(creep);
		}
	}
	else 
	{
		// First, we're going to check for ramparts with hits < 10%. We're using ramparts as the first line of defense
		// and we want them nicely maintained. This is especially important when under attack. The builder will
		// repair the most damaged ramparts first
		var structures = creep.room.find(FIND_MY_STRUCTURES);
		var damagedRamparts = [];

		for(var index in structures)
		{
			var structure = structures[index];
			if(structure.structureType == 'rampart' && structure.hits < (structure.hitsMax / 10))
			{
				damagedRamparts.push(structure);
			}
		}

		damagedRamparts.sort(function(a, b)
		{
			return a.hits - b.hits;
		});

		if (damagedRamparts.length)
		{
			creep.moveTo(damagedRamparts[0]);
			creep.repair(damagedRamparts[0]);

			return;
		}

		// Next we're going to look for general buildings that have less than 50% health, and we'll go to repair those.
		// We set it at 50%, because we don't want builders abandoning their duty every time a road gets walked on
		var toRepair = [];
		for (var index in structures)
		{
			if((structures[index].hits / structures[index].hitsMax) < 0.5)
			{
				toRepair.push (structures[index]);
			}
		}

		if (toRepair.length)
		{
			var structure = toRepair[0];
			creep.moveTo (structure);
			creep.repair (structure);

			return;
		}

		//If no repairs are needed, we're just going to go find some structures to build
		var targets = creep.room.constructionSites;
		var target = creep.pos.findClosestByRange (targets);
		
		if (target) 
		{
			this.moveAndPerform (target, creep.build);
			return;
		}
		else
		{
			target = this.rangedAttack ();
			
			if (target)
			{
				this.kite (target);
			}

			this.rest (true);
		}
	}
}

module.exports = Builder;
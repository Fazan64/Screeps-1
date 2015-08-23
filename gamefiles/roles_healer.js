/**
 * @param creep
 */
var proto = require('role_prototype');

var healer = 
{
	
	baseParts : [HEAL, TOUGH],

	action: function()
	{
		var creep = this.creep;

		this.keepAwayFromEnemies();

		// Find my creeps that are hurt. If they're hurt, heal them.
		// If there aren't any hurt, we're going to try and get the healers
		// to tick near the guards, so that they're close by when the battle starts
		var target = this.getClosest (Game.creeps, { 
			filter: function (t) 
			{ 
				return t.hits < t.hitsMax 
			} 
		});

		if (target)
		{
			this.moveAndPerform (target, creep.heal);
		}
		else 
		{
			this.rest ();
		}
	}
};

module.exports = healer;
var ProtoRole = require ("role_prototype");

/**
 * @class
 * @constructor
 */
function Healer () { ProtoRole.apply (this, arguments) }

Healer.prototype = Object.create (ProtoRole.prototype);

Healer.prototype.baseParts = [HEAL];

Healer.prototype.action = function ()
{
	var creep = this.creep;

	this.keepAwayFromEnemies();

	// Find my creeps that are hurt. If they're hurt, heal them.
	// If there aren't any hurt, we're going to try and get the healers
	// to tick near the guards, so that they're close by when the battle starts
	var target = this.getClosest (creep.room.myDamagedCreeps) || this.getClosest (creep.room.defenders);

	if (target)
	{
		this.moveAndPerform (target, creep.heal);
	}
	else 
	{
		this.rest ();
	}
}

module.exports = Healer;
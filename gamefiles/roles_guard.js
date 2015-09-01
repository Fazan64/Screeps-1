var ProtoRole = require ("role_prototype");

function notSourceKeeper (enemy) 
{
	return enemy.owner.username !== "Source Keeper"
}

/**
 * @class
 * @constructor
 */
function Guard () { ProtoRole.apply (this, arguments) }

Guard.prototype = Object.create (ProtoRole.prototype);

Guard.prototype.baseParts = [ATTACK, TOUGH];

Guard.prototype.action = function()
{
	var creep = this.creep;

	var target = this.getClosest (creep.room.hostileCreeps.filter (notSourceKeeper));
	
	if (target)
	{
		this.moveAndPerform (target, creep.attack);
	}
	else
	{
		this.rest ();
	}
}

module.exports = Guard;
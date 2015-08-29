var ProtoRole = require ("role_prototype");

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

	var target = this.getClosest (FIND_HOSTILE_CREEPS, {
		filter : function (enemy) 
		{
			return enemy.owner.username !== "Source Keeper"
		}
	});
	
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
var ProtoRole = require ("role_prototype");

Memory.focusFire = Memory.focusFire || [];

/**
 * @class
 * @constructor
 */
function Archer () { ProtoRole.apply (this, arguments) }

Archer.prototype = Object.create (ProtoRole.prototype);

Archer.prototype.baseParts = [TOUGH, RANGED_ATTACK];

/**
* @TODO: We need to get archers to prioritise their targets better
*/
Archer.prototype.action = function()
{
	var target = null;
	// Find a reachable target to attack, if can't,
	// find it using the getRangedTarget function
	// and add it to the focusFire array
	for (var i in Memory.focusFire)
	{
		var enemy = Memory.focusFire [i];
		
		if (!enemy)
		{
			Memory.focusFire.splice (i, 1);
			continue;
		}
		
		if (this.creep.pos.inRangeTo (enemy.pos, 3))
		{
			target = Game.getObjectById (enemy);
			break;
		}
	}
	
	if (!target)
	{
		target = this.getRangedTarget ();
		if (target && Memory.focusFire.indexOf ( {id :target.id, pos : target.pos}) === -1)
		{		
			Memory.focusFire.push (
			{
				id : target.id,
				pos : target.pos
			});
		}
	}
	
	if (target)
	{
		this.rangedAttack (target);
		this.kite (target);
	}
	else
	{
		this.rest ();
	}
	
}

module.exports = Archer;
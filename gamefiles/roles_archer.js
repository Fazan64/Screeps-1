var ProtoRole = require ("role_prototype");

/**
 * @class
 * @constructor
 */
function Archer () { ProtoRole.apply (this, arguments) }

Archer.prototype = Object.create (ProtoRole.prototype);

Archer.prototype.baseParts = [RANGED_ATTACK, TOUGH];

/**
* @TODO: We need to get archers to prioritise their targets better
*/
Archer.prototype.action = function()
{
	var creep = this.creep;

	var target = this.getRangedTarget ();
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
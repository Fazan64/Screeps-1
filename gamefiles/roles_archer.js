var archer =
{

	baseParts : [RANGED_ATTACK, TOUGH],

	/**
	 * Here we want Archer to automatically scale to however many extensions we have
	 * @returns {Array}
	 */
	getParts: function()
	{
		var _= require('lodash');

		var partsAllowed = Game.getRoom('1-1').find(Game.MY_STRUCTURES, {
			filter: function(structure)
			{
				return (structure.structureType == Game.STRUCTURE_EXTENSION && structure.energy >= 200);
			}
		}).length;
		partsAllowed += 5;

		var modulo = partsAllowed % 2;
		partsAllowed -= modulo;
		partsAllowed /= 2;

		if (partsAllowed > 5)
			partsAllowed = 5;

		var parts = [ ];
		for(var i = 0; i < partsAllowed; i++) 
		{
			parts.unshift(Game.RANGED_ATTACK);
			parts.push(Game.MOVE);
		}

		return parts;
	},

	/**
	 * @TODO: We need to get archers to prioritise their targets better
	 */
	action: function()
	{
		var creep = this.creep;

		var target = this.getRangedTarget ();
		if (target !== null)
		{
			this.rangedAttack (target);
		}
		else
		{
			target = this.getClosest (FIND_HOSTILE_CREEPS);
		}
		
		if (target !== null)
		{
			this.kite (target);
		}
		else
		{
			this.rest ();
		}
		
	}
};

module.exports = archer;
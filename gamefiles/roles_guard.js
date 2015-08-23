/**
 * @param creep
 */
var guard = 
{
	
	baseParts : [ATTACK, TOUGH],

	action: function()
	{
		var creep = this.creep;

		var target = this.getClosest (FIND_HOSTILE_CREEPS);
		
		if (target)
		{
			if (!creep.pos.isNearTo(target))
			{
				creep.moveTo (target);
			}
			else
			{
				creep.attack (target);
			}
		}
		else
		{
			this.rest ();
		}
	}
};

module.exports = guard;
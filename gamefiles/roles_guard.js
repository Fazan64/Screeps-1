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
			this.moveAndPerform (target, creep.attack);
		}
		else
		{
			this.rest ();
		}
	}
};

module.exports = guard;
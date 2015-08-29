var archer =
{

	baseParts : [RANGED_ATTACK, TOUGH],

	/**
	 * @TODO: We need to get archers to prioritise their targets better
	 */
	action: function()
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
};

module.exports = archer;
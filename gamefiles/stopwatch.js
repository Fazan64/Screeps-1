function Stopwatch () {}

Object.defineProperties (Stopwatch.prototype, {
	usedCpu : 
	{
		get : function ()
		{
			if (!this._usedObStart)
			{
				return 0;
			}
			return Game.getUsedCpu () - this._usedOnStart;
		}
	}
});

Stopwatch.prototype.restart = function ()
{
	this._usedOnStart = Game.getUsedCpu (); 
} 

module.exports = Stopwatch;
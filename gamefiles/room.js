function initMemory (room)
{
	if (Memory.room.needs === undefined)
	{
		var needs = Memory.room.needs = {};
		needs.creeps = [];
	}
}

module.exports = function (room)
{
	initMemory ();
}
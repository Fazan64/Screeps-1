function initMemory (room)
{
	if (room.memory.needs === undefined)
	{
		var needs = room.memory.needs = {};
		needs.creeps = [];
	}
}

module.exports = function (room)
{
	initMemory ();
}
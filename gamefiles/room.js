function initMemory (room)
{
	if (room.memory.needs === undefined)
	{
		var needs = room.memory.needs = {};
		needs.creeps = [];
		// temp
		needs.creeps.push (
			{
				role : 'harvester',
				memory : {}
			}
		);
	}
}

module.exports = function (room)
{
	initMemory ();
}
/**
 * DEPRECATED DON'T USE
 */
module.exports = function(type, includeQueued)
{
	if (includeQueued == undefined)
	{
		includeQueued = false;
	}

	//Get the current room, then find all creeps in that room by their role
	var room = Game.getRoom('1-1');
	
	var count = room.myCreeps.filter (function (creep)
	{
		return creep.memory.role == type
	}).length;

	if (includeQueued)
	{
		var spawns = Game.spawns;

		for(var i in spawns)
		{
			var spawn = spawns[i];
			if(spawn.spawning !== null
				&& spawn.spawning !== undefined
				&& Memory.creeps[spawn.spawning.name].role == type) {
				count++;
			}
		}



		count += Memory.spawnQue.filter(function(qued)
		{
			return qued == type;
		}).length;
	}

	return count;
};
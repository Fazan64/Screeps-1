module.exports = function(type, includeQued)
{
	if (includeQued == undefined)
	{
		includeQued = false;
	}

	//Get the current room, then find all creeps in that room by their role
	var room = Game.getRoom('1-1');

	var count = room.find(Game.MY_CREEPS, {
		filter: function(creep)
		{
			return creep.memory.role == type
		}
	}).length;

	if(includeQued)
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
Room.prototype.addToNeedsCreep = function (role, memory)
{
	
	if (memory === undefined)
	{
		memory = {}
	}
	memory.role = role;
	
	var needed = this.memory.needs.creeps;
	if (needed [role] === undefined)
	{
		needed [role] = [];
	}
	
	needed [role].push (
	{
		role: role,
		memory: memory
	});
	
}

/**
 * Gets a creep info object specifying a creep the room needs.
 * Use room.needFulfilledCreep (role) after creation
 */
Room.prototype.getNeededCreep = function ()
{
	for (var roleName in this.memory.needs.creeps)
	{
		var creepsToMake = this.memory.needs.creeps [roleName];
		if (creepsToMake.length)
		{
			return creepsToMake [0];
		}
	}
}

/**
 * Makes the room remove a single creep info of role 'role' from its needs.
 * To use after a creep meeting the creep specs was successfully created
 */
Room.prototype.needFulfilledCreep = function (role)
{
	if (this.memory.needs.creeps [role] !== undefined)
	{
		this.memory.needs.creeps [role].shift (); 
	}
}

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
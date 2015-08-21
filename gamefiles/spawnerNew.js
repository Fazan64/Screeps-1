/** 
 * Returns an object {name, index} having a generated name and an index
 * for a Creep with memory.role 'role' which is to be spawned by Spawn 'spawn'
 */
function getNameByRole(spawn, role)
{
    var creepIndex = 0;
    var creeps = Game.creeps;
    
    while (creeps [spawn.room.name + ' ' + role + ' ' + creepIndex]) 
    {
        creepIndex++;
    }
    
    var answer =  
    {
        name : spawn.room.name + ' ' + role + ' ' + creepIndex,
        index : creepIndex
    };
    return answer;
}

var manager = require('roleManager');
function spawnCreep (role, memory, spawnPoint)
{
	if (!spawnPoint)
	{
		spawnPoint = Game.spawns.Spawn1;
	}

	if (!manager.roleExists(role))
	{
		return;
	}

	if (memory == undefined)
	{
		memory = {};
	}

	memory ['role'] = role;

    var body = manager.getRoleBodyParts (energy);
    if (!body.length)
    {
        return;
    }
    
	var name = getNameByRole (spawnPoint, role);

	console.log('Trying to spawn ' + role + '...');
	return spawnPoint.createCreep (body, name, memory) == name;
}

function spawnNeededCreep (spawn) 
{
    // Spawn's busy
    if (spawn.spawning) 
	{
        return;
	}
	
	var needed = spawn.room.memory.needs.creeps;
    // Nothing to create, queue's empty
    if (!needed || !needed.length) 
	{
        return;
	}
	
    // Creation process started successfully
    if (spawnCreep (needed [0].role, needed [0].memory, spawn))
    {
        console.log ("  Spawn successful! ");
        needed.shift ();
    }
}

module.exports = function (spawn)
{
	spawnNeededCreep ();
}
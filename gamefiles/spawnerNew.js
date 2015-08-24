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


/**
 * Returns the total energy available to Spawn 'spawn'
 * i.e in itself and extensions
 */
function getTotalEnergy (spawn)
{
    var totalEnergy = spawn.energy;

    var extensions = spawn.room.find (FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });
    
    for (var extension in extensions)
    {
        totalEnergy += extension.energy;
    }
    
    return totalEnergy;
}

var manager = require('roleManager');
function spawnCreep (role, memory, spawn)
{

	if (!manager.roleExists(role))
	{
		return;
	}

	if (memory == undefined)
	{
		memory = {};
	}

	memory ['role'] = role;

    var body = manager.getRoleBodyParts (getTotalEnergy (spawn));
    if (!body.length)
    {
        return;
    }
    
	var name = getNameByRole (spawn, role);

	console.log('Trying to spawn ' + role + '...');
	return spawn.createCreep (body, name, memory) == name;
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
	spawnNeededCreep (spawn);
}
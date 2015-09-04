var manager = require ('roleManager');
var calculateCost = require ('calculateCost');
/** 
 * Returns an object {name, index} having a generated name and an index
 * for a Creep with memory.role 'role' which is to be spawned by Spawn 'spawn'
 */
function getNameByRole (spawn, role)
{
    var creepIndex = 0;
    
    while (Game.creeps [spawn.room.name + ' ' + role + ' ' + creepIndex] !== undefined) 
    {
        creepIndex++;
    }
    
    return spawn.room.name + ' ' + role + ' ' + creepIndex;
}


/**
 * Returns the total energy available to Spawn 'spawn'
 * i.e in itself and extensions
 */
function getTotalEnergy (spawn)
{
    var totalEnergy = spawn.room.energyAvailable;
    
    var otherSpawns = spawn.room.mySpawns.filter (function (otherSpawn)
    {
        return otherSpawn !== spawn;
    })
    
    if (otherSpawns && otherSpawns.length)
    {
        for (var i in otherSpawns)
        {
            totalEnergy -= otherSpawns [i].energy;
        }
    }
    
    return totalEnergy;
}

function spawnCreep (role, memory, spawn)
{

	if (!manager.roleExists(role))
	{
        console.log ("There is no such role as " + role + ". Aborting...");
		return;
	}

	if (memory == undefined)
	{
		memory = {};
	}

	memory ['role'] = role;

    var totalEnergy = getTotalEnergy (spawn)
    var body = manager.getRoleBodyParts (role, totalEnergy);
    if (!body.length || calculateCost (body) > totalEnergy)
    {
        console.log ("Not enough energy (currently " + totalEnergy + ") to spawn a creep of role " + role + ". Aborting...");
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
        console.log ("Room's needs queue is empty! Idling...");
        return;
	}
	
    // Creation process started successfully
    if (spawnCreep (needed [0].role, needed [0].memory, spawn))
    {
        console.log ("  Spawn successful!");
        needed.shift ();
    }
}

module.exports = function spawner (spawn)
{
	spawnNeededCreep (spawn);
}
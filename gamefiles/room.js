function getEnergySupply (room)
{
	var total = 0;
	
	for (var i in room.memory.suppliers)
	{
		total += room.memory.suppliers [i].supplyPerTick;
	}
	
	return total;
}

function initMemory (room)
{
	if (!room.memory.initialized)
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
			needs.creeps.push (
				{
					role : 'miner',
					memory : {}
				}
			);
		}
		
		if (room.memory.suppliers === undefined)
		{
			room.memory.suppliers = {};
		}
		
		room.memory.initialized = true;
	}
}

var neededSupply = 9999;
module.exports = function (room)
{
	initMemory (room);
	
	
	var neededRole = 'miner';
	
	var energySupply = getEnergySupply (room);
	if (energySupply == 0)
	{
		neededRole = 'harvester';
	}
	
	if (energySupply < neededSupply)
	{
		room.memory.needs.creeps.push (
			{
				role : neededRole,
				memory : {}
			}
		);
	} 
	
}
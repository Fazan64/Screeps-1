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

module.exports = function (room)
{
	initMemory (room);
}
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
		var needs = room.memory.needs = {};
		needs.creeps = [];
		
		if (room.memory.suppliers === undefined)
		{
			room.memory.suppliers = {};
		}
		
		room.memory.initialized = true;
	}
}

var neededSupply = 15;
function updateNeeds (room)
{
	var newNeeds = 
	{
		creeps : []
	};
	
	var miners = room.find (FIND_MY_CREEPS, { 
		filter : function (creep) {
			return creep.memory.role == "miner";
		}
	});
	
	for (var i in miners)
	{
		var miner = miners [i];
		var helpersToAdd = miner.memory.helpersNeeded - miner.memory.helpers.length; 

		// Won't execute if helpersToAdd <= 0
		for (var i = 0; i < helpersToAdd; i++) 
		{
			newNeeds.creeps.push (
				{
					role : "miner_helper",
					memory : { miner : miner.id }
				}
			)
		}
	}
	
	var energySupply = getEnergySupply (room);
	var neededRole = 'miner';
	if (energySupply == 0)
	{
		var neededRole = 'harvester';
	}
	
	if (energySupply < neededSupply)
	{
		newNeeds.creeps.push (
			{
				role: neededRole,
				memory: {}
			}
		)
	}
	
	room.memory.needs = newNeeds;
}

module.exports = function (room)
{
	initMemory (room);
	
	updateNeeds (room);
}
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
		needs.energy = 0;
		
		room.memory.suppliers = {};
		
		room.memory.initialized = true;
	}
}

var MIN_SUPPLY = 4;
var neededSupply = 15;
function updateNeeds (room)
{
	var newNeeds = 
	{
		creeps : [],
		energy : 0
	};
	
	var creeps = room.find (FIND_MY_CREEPS);
	
	var energySupply = getEnergySupply (room);
	// Minimum reached, now we need non-suppliers
	if (energySupply >= MIN_SUPPLY)
	{
		
		var hostiles = room.find (FIND_HOSTILE_CREEPS);
		
		var defenders = creeps.filter (function (creep)
		{
			// If has offensive bodyparts && has an appropriate role
			return (creep.memory.role == "archer"
				||  creep.memory.role == "guard")
				&& (creep.getActiveBodyparts (RANGED_ATTACK)
				||  creep.getActiveBodyparts (ATTACK))
						
		});
		
		// Add required amount of defenders to the needs array
		if (defenders.length < hostiles.length + 1)
		{
			var neededDefenders = hostiles.length - defenders.length + 1;
			for (var i = 0; i < neededDefenders; i++)
			{
				newNeeds.creeps.push (
					{
						role : "archer",
						memory : {}
					}
				)
			}
		}
		
	}
	
	// Assign helpers for miners
	var miners = creeps.filter (function (creep) 
	{
		return creep.memory.role == "miner";
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
	
	var neededRole = 'miner';
	if (energySupply == 0)
	{
		var neededRole = 'harvester';
	}
	
	if (energySupply < neededSupply)
	{
		newNeeds.energy = neededSupply - energySupply;
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
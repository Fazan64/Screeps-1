var DEFENDERS_PER_HEALER = 3;
var UPGRADERS_REQUIRED = 3;

function RoomManager (room)
{
	this.room = room;
} 

RoomManager.prototype.getEnergySupply = function ()
{
	var room = this.room;
	var total = 0;
	
	for (var i in room.memory.suppliers)
	{
		total += room.memory.suppliers [i].supplyPerTick;
	}
	
	return total;
}

RoomManager.prototype.initMemory = function ()
{
	var room = this.room;
	if (!room.memory.initialized)
	{
		var needs = room.memory.needs = {};
		needs.creeps = [];
		needs.energy = 0;
		
		room.memory.suppliers = {};
		room.memory.upgraders = {};
		
		room.memory.initialized = true;
	}
}

var MIN_SUPPLY = 4;
var neededSupply = 15;
RoomManager.prototype.updateNeeds = function ()
{
	var room = this.room;
	var newNeeds = 
	{
		creeps : [],
		energy : 0
	};
	
	var creeps = room.find (FIND_MY_CREEPS);
	
	var energySupply = this.getEnergySupply ();
	// Minimum reached, now we need non-suppliers
	if (energySupply >= MIN_SUPPLY)
	{
		
		var hostiles = room.find (FIND_HOSTILE_CREEPS);
		
		//------------------------------------------------
		var defenders = creeps.filter (function (creep)
		{
			// If has offensive bodyparts && has an appropriate role
			return (creep.memory.role == "archer"
				||  creep.memory.role == "guard")
				&& (creep.getActiveBodyparts (RANGED_ATTACK) > 0
				||  creep.getActiveBodyparts (ATTACK) > 0)
						
		});
		
		// Add required amount of defenders to the needs array
		var neededDefenders = hostiles.length - defenders.length + 1;
		// Won't execute if neededDefenders <= 0
		for (var i = 0; i < neededDefenders; i++)
		{
			newNeeds.creeps.push (
				{
					role : "archer",
					memory : {}
				}
			)
		}
		//--------------------------------------------------
		//--------------------------------------------------
		var healers = creeps.filter (function (creep)
		{
			return creep.memory.role == "healer"
				&& creep.getActiveBodyparts (HEAL) > 0	
		})
		
		// The idea is to have a single healer per [DEFENDERS_PER_HEALER] defenders
		var needeedHealers = Math.floor (defenders.length / DEFENDERS_PER_HEALER) - healers.length;
		// Won't execute if needeedHealers <= 0
		for (var i = 0; i < needeedHealers; i++)
		{
			newNeeds.creeps.push (
				{
					role : "healer",
					memory : {}
				}
			)
		}
		//--------------------------------------------------
		//--------------------------------------------------
		
		// Keep the upgrader count in the room constant
		var neededUpgraders = UPGRADERS_REQUIRED - room.memory.upgraders.keys ().length;
		for (var i = 0; i < neededUpgraders; i++)
		{
			newNeeds.creeps.push (
				{
					role : "upgrader",
					memory : {}
				}
			)
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

module.exports = RoomManager;
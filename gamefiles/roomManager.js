var DEFENDERS_PER_HEALER = 3;
var UPGRADERS_REQUIRED = 3;

Object.defineProperties (Room.prototype,
{
	creeps :
	{
		get : function ()
		{
			this._creeps = this._creeps || this.find (FIND_CREEPS);
			return this._creeps;
		}
	},
	
	myCreeps :
	{
		get : function ()
		{
			this._myCreeps = this._myCreeps || this.find (FIND_MY_CREEPS);
			return this._myCreeps;
		}
	},
	
	hostileCreeps :
	{
		get : function ()
		{
			this._hostileCreeps = this._hostileCreeps || this.find (FIND_HOSTILE_CREEPS);
			return this._hostileCreeps;
		}
	},
	
	mySpawns :
	{
		get : function ()
		{
			this._spawns = this._spawns || this.find (FIND_MY_SPAWNS);
			return this._spawns;
		}
	},
	
	constructionSites :
	{
		get : function ()
		{
			this._constructionSites = this._constructionSites || this.find (FIND_CONSTRUCTION_SITES);
			return this._constructionSites;
		}
	}	
});

function RoomManager (room)
{
	this.room = room;
	this.needs =
	{
		creeps : [],
		energy : 0
	};
}

Object.defineProperties (RoomManager.prototype,
{
	defenders :
	{
		get : function ()
		{
			this._defenders = this._defenders || this.room.myCreeps.filter (function (creep)
			{
				// If has offensive bodyparts && has an appropriate role
				return (creep.memory.role == "archer"
					||  creep.memory.role == "guard")
					&& (creep.getActiveBodyparts (RANGED_ATTACK) > 0
					||  creep.getActiveBodyparts (ATTACK) > 0)		
			})
			return this._defenders;
		}
	},
	
	energySupply :
	{
		get : function ()
		{
			if (!this._energySupply)
			{
				this._energySupply = 0;
		
				for (var i in this.room.memory.suppliers)
				{
					this._energySupply += this.room.memory.suppliers [i].supplyPerTick;
				}
			}
			return this._energySupply;
		}
	}	
});

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
	
	this.needs =
	{
		creeps : [],
		energy : 0
	};
	
	// Minimum reached, now we need non-suppliers
	if (this.energySupply >= MIN_SUPPLY)
	{
		this.updateNeedsDefenders ();
		
		this.updateNeedsHealers ();
		
		this.updateNeedsUpgraders ();
	}
	
	this.updateNeedsHelpers ();
	
	this.updateNeedsSuppliers ();
	
	this.setNeeds ();
	
}

RoomManager.prototype.updateNeedsHelpers = function ()
{
	var room = this.room;
	
	// Assign helpers for miners
	var miners = room.myCreeps.filter (function (creep) 
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
			this.needs.creeps.push (
				{
					role : "miner_helper",
					memory : { miner : miner.id }
				}
			)
		}
	}
}

RoomManager.prototype.updateNeedsSuppliers = function ()
{
	var neededRole = 'miner';
	if (this.energySupply == 0)
	{
		neededRole = 'harvester';
	}
	
	if (this.energySupply < neededSupply)
	{
		this.needs.creeps.push (
			{
				role: neededRole,
				memory: {}
			}
		)
		this.needs.energy = neededSupply - this.energySupply;
	}
}

RoomManager.prototype.updateNeedsDefenders = function ()
{
	// Add required amount of defenders to the needs array
	var neededDefenders = this.room.hostileCreeps.length - this.defenders.length + 1;
	// Won't execute if neededDefenders <= 0
	for (var i = 0; i < neededDefenders; i++)
	{
		this.needs.creeps.push (
			{
				role : "archer",
				memory : {}
			}
		)
	}
}

RoomManager.prototype.updateNeedsHealers = function ()
{
	var room = this.room;
	
	var healers = room.myCreeps.filter (function (creep)
	{
		return creep.memory.role == "healer"
			&& creep.getActiveBodyparts (HEAL) > 0	
	})
	
	// The idea is to have a single healer per [DEFENDERS_PER_HEALER] defenders
	var needeedHealers = Math.floor (this.defenders.length / DEFENDERS_PER_HEALER) - healers.length;
	// Won't execute if needeedHealers <= 0
	for (var i = 0; i < needeedHealers; i++)
	{
		this.needs.creeps.push (
			{
				role : "healer",
				memory : {}
			}
		)
	}
}

RoomManager.prototype.updateNeedsUpgraders = function ()
{
	// Keep the upgrader count in the room constant
	var neededUpgraders = UPGRADERS_REQUIRED - Object.keys (this.room.memory.upgraders).length;
	for (var i = 0; i < neededUpgraders; i++)
	{
		this.needs.creeps.push (
			{
				role : "upgrader",
				memory : {}
			}
		)
	}
}

RoomManager.prototype.setNeeds = function ()
{
	this.room.memory.needs = this.needs;
}

module.exports = RoomManager;
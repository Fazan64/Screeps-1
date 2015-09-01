var DEFENDERS_PER_HEALER = 3;
var CIVILIANS_PER_HEALER = 5;

var CONSTRUCTION_SITES_PER_BUILDER = 0.5;
var UPGRADERS_REQUIRED = 2;

function isDefender (creep)
{
	// If has offensive bodyparts && has an appropriate role
	return (creep.memory.role == "archer"
		||  creep.memory.role == "guard")
		&& (creep.getActiveBodyparts (RANGED_ATTACK) > 0
		||  creep.getActiveBodyparts (ATTACK) > 0);		
}

function isScavenger (creep)
{
	return creep.memory.role == "scavenger"; 	
}

function isDamaged (creep) 
{ 
	return creep.hits < creep.hitsMax;
}

function notSourceKeeper (creep)
{ 
	return creep.owner.username !== "Source Keeper"; 
}

function isMiner (creep) 
{
	return creep.memory.role == "miner";
}

function isHealer (creep)
{
	return creep.memory.role == "healer"
		&& creep.getActiveBodyparts (HEAL) > 0;	
}

function isBuilder (creep)
{
	return creep.memory.role == "builder"
		&& creep.getActiveBodyparts (WORK) > 0
		&& creep.getActiveBodyparts (MOVE) > 0;	
}

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
	
	defenders :
	{
		get : function ()
		{
			this._defenders = this._defenders || this.myCreeps.filter (isDefender)
			return this._defenders;
		}
	},
	
	scavengers : 
	{
		get : function ()
		{
			this._scavengers = this._scavengers || this.myCreeps.filter (isScavenger);
			return this._scavengers;
		}	
	},
	
	myDamagedCreeps :
	{
		get : function ()
		{
			this._myDamagedCreeps = this._myDamagedCreeps || this.myCreeps.filter (isDamaged)
			return this._myDamagedCreeps;
		}	
	},
	
	myStructures : 
	{
		get : function ()
		{
			this._myStructures = this._myStructures || this.find (FIND_MY_STRUCTURES);
			return this._myStructures;
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
	},
	
	sourcesActive :
	{
		get : function ()
		{
			this._sourcesActive = this._sourcesActive || this.find (FIND_SOURCES_ACTIVE);
			return this._sourcesActive;
		}
	},
	
	droppedEnergy :
	{
		get : function ()
		{
			this._droppedEnergy = this._droppedEnergy || this.find (FIND_DROPPED_ENERGY);
			return this._droppedEnergy;
		}
	},
	
	underAttack :
	{
		get : function ()
		{
			this._underAttack = this._underAttack || this.hostileCreeps.filter (notSourceKeeper).length > 0;
			return this._underAttack;
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
				
				for (var i in this.room.memory.consumers)
				{
					this._energySupply -= this.room.memory.consumers [i].consumptionPerTick;
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
		room.memory.consumers = {};
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
	if (this.energySupply >= MIN_SUPPLY || this.room.underAttack)
	{
		this.updateNeedsDefenders ();
		
		this.updateNeedsHealers ();
		
		this.updateNeedsScavengers ();
		
		this.updateNeedsBuilders ();
		
		this.updateNeedsUpgraders ();
	}
	
	this.updateNeedsHelpers ();
	
	this.updateNeedsSuppliers ();
	
	// If doesn't need anything
	if (this.needs.creeps.length == 0)
	{
		this.updateNeedsSurplus ();
	}
	
	this.setNeeds ();
	
}

RoomManager.prototype.updateNeedsHelpers = function ()
{
	var room = this.room;
	
	// Assign helpers for miners
	var miners = room.myCreeps.filter (isMiner);
	
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
		);
		this.needs.energy = neededSupply - this.energySupply;
	}
}

RoomManager.prototype.updateNeedsDefenders = function ()
{
	// Add required amount of defenders to the needs array
	var neededDefenders = this.room.hostileCreeps.length - this.room.defenders.length + 1;
	// Won't execute if neededDefenders <= 0
	for (var i = 0; i < neededDefenders; i++)
	{
		this.needs.creeps.push (
			{
				role : "archer",
				memory : {}
			}
		);
	}
}

RoomManager.prototype.updateNeedsHealers = function ()
{
	var room = this.room;
	
	var healers = room.myCreeps.filter (isHealer);
	
	// The idea is to have a single healer per [DEFENDERS_PER_HEALER] defenders
	var neededHealers = Math.floor (this.room.defenders.length / DEFENDERS_PER_HEALER) - healers.length;
	
	if (neededHealers <= 0)
	{
		neededHealers = Math.ceil (room.myDamagedCreeps.length / CIVILIANS_PER_HEALER) - healers.length;
	}
	
	// Won't execute if neededHealers <= 0
	for (var i = 0; i < neededHealers; i++)
	{
		this.needs.creeps.push (
			{
				role : "healer",
				memory : {}
			}
		);
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

RoomManager.prototype.updateNeedsBuilders = function ()
{
	var room = this.room;
	
	var builders = room.myCreeps.filter (isBuilder);
	
	var constrSites = room.constructionSites.length;
	var neededBuilders = Math.ceil (constrSites / CONSTRUCTION_SITES_PER_BUILDER) - builders.length;
	for (var i = 0; i < neededBuilders; i++)
	{
		this.needs.creeps.push (
			{
				role : "builder",
				memory : {}
			}
		);
	}
}

RoomManager.prototype.updateNeedsScavengers = function ()
{
	if (this.room.droppedEnergy.length && this.room.scavengers.length == 0)
	{
		this.needs.creeps.push (
			{
				role : "scavenger",
				memory : {}
			}
		);
	}
}

RoomManager.prototype.updateNeedsSurplus = function ()
{
	if (this.energySupply == this.room.energyCapacityAvailable)
	{
		this.needs.creeps.push (
			{
				role : "archer"
			}
		);
	}
}

RoomManager.prototype.setNeeds = function ()
{
	this.room.memory.needs = this.needs;
}

module.exports = RoomManager;
var ProtoRole = require ("role_prototype");

/**
 * This guy does the other half of energy collection. The miner gets it from the source, and the helper does the
 * transportation. We don't want them just going for the nearest source, as that means that if we have more than one
 * miner, all the helpers will only go for the first miner. To counter this, we assign them to a miner the same way
 * we assign a miner to a source
 * @class
 * @constructor
 */
function MinerHelper () { ProtoRole.apply (this, arguments) }

MinerHelper.prototype = Object.create (ProtoRole.prototype);

MinerHelper.prototype.baseParts = [CARRY, MOVE];

Object.defineProperties (MinerHelper.prototype,
{
	spawn : 
	{
		get : function ()
		{
			if (!this._spawn)
			{
				if (this.creep.memory.spawn)
				{
					this._spawn = Game.getObjectById (this.creep.memory.spawn);
					if (!this._spawn)
					{
						this.assignSpawn ();
					}	
				}
				else 
				{
					this.assignSpawn ();
				}
			}
			return this._spawn;
		},
		set : function (value)
		{
			this._spawn = value;
			if (this._spawn)
			{
				this.creep.memory.spawn = this._spawn.id;	
			}
		}	
	},
	miner :
	{
		get : function ()
		{
			if (!this._miner)
			{
				if (this.creep.memory.miner)
				{
					this._miner = Game.getObjectById (this.creep.memory.miner);
					if (!this._miner)
					{
						this.assignMiner ();
					}
				}
				else 
				{
					this.assignMiner ();
				}
			}
			return this._miner;
		},
		set : function (value)
		{
			this._miner = value;
			if (this._miner)
			{
				this.creep.memory.miner = this._miner.id;
				this._miner.memory.helpers.push (this.creep.id);
			}
		}
	}	
});

MinerHelper.prototype.assignSpawn = function ()
{
	var spawn = this.getClosest (this.creep.room.mySpawns);
	
	if (!spawn)
	{
		return;
	}
	
	this.spawn = spawn;
}

MinerHelper.prototype.assignMiner = function () 
{
	var creep = this.creep;
	
	var miner = this.getClosest (creep.room.myCreeps.filter (function (miner) 
	{
		return miner.memory.role == 'miner' && miner.memory.helpers.length < miner.memory.helpersNeeded;
	}));

	if (!miner)
	{
		return;
	}
	
	this.miner = miner;
	
	// Tell the room that we now supply it with energy
	var spawn = Game.getObjectById (creep.memory.spawn);
	spawn.room.memory.suppliers [creep.id] = 
	{ 
		supplyPerTick: miner.memory.minedPerTick
	}
}

MinerHelper.prototype.onStart = function ()
{
	var creep = this.creep;
	creep.memory.id = creep.id;
	// Because I want it to be done ASAP
	this.assignSpawn ();
	this.assignMiner ();
}

MinerHelper.prototype.onDeath = function (memory)
{
	// We no longer supply the room with energy
	var spawn = Game.getObjectById (memory.spawn);
	delete spawn.room.memory.suppliers [memory.id];
	
	if (memory.miner)
	{
		var miner = Game.getObjectById (memory.miner);
		if (miner)
		{
			// Remove itself from miner helpers
			for (var i in miner.memory.helpers)
			{
				if (miner.memory.helpers [i] == memory.id)
				{
					miner.memory.helpers.splice (i, 1);
					break;
				}
			}
		}
	}
}

/**
* @TODO: Make helpers smarter about avoiding miners, instead of just waiting till they're 5 tiles away
* @TODO: When spawns are at .25, and extensions have >= 200, help builders before filling shit up
*/
MinerHelper.prototype.action = function ()
{
	var creep = this.creep;

	// The idea behind the courier stuff is that miner_helpers 
	// can pass energy between each other to make energy transition
	// [theoretically] faster, and, which is more important, 
	// reduce pathfinding costs, since a creep will only have
	// to find a path to its closest colleague instead of performing
	// a multiple-room pathfinding process.
	
	if (creep.memory.courier) 
	{
		var courier = Game.getObjectById (creep.memory.courier);
		this.moveAndPerform (courier, creep.transferEnergy);
		creep.memory.courier = null;
		return;
	}

	var miner = this.miner;
	
	if (miner === null) 
	{
		creep.say ("I see no miners to help, and thus I die");
		creep.suicide ();
		return;
	}

	// If we can still pick up energy, let's do that
	if (creep.carry.energy < creep.carryCapacity) 
	{
		
		if (creep.pos.isNearTo (miner)) 
		{
			var energyOrbs = miner.pos.lookFor ('energy');
			if (energyOrbs !== null && energyOrbs.length)
			{
				creep.pickup (energyOrbs [0]);
			}
		}
		// We're not near miner going to him
		else
		{
			// But first lets try looking for helpers already 
			// returning from the miner to deliver energy, and 
			// take it from them.
			
			// We'll check on making sure 
			// they're not us,
			// they're the same role,
			// they work for the same miner,
			// they are not already chosen by someone else
			// they have some energy, and
			// they're further from target than we are.
			
			var spawn = this.spawn;
			
			var creepToHelp = creep.pos.findClosestByRange (creep.room.myCreeps.filter (function (possibleTarget)
			{
				return possibleTarget !== creep
					&& possibleTarget.memory.role === creep.memory.role
					&& possibleTarget.memory.miner === creep.memory.miner
					&& !possibleTarget.memory.courier
					&& possibleTarget.carry.energy == possibleTarget.carryCapacity
					&& spawn.pos.getRangeTo (creep) < spawn.pos.getRangeTo (possibleTarget);
			}));	
			
			if (creepToHelp)
			{
				creep.say ("Take energy");
				creepToHelp.say ("Give energy");
				creepToHelp.memory.courier = creep.id;
				
				if (!creep.pos.isNearTo (creepToHelp))
				{
					creep.moveTo (creepToHelp);
				}
			}
			else if (miner.memory.isNearSource)
			{
				creep.moveTo (miner);
			}
			else
			{
				this.rest (true);
			}
		}
		
	}
	// Okay, everything below is for dropping energy off
	else
	{
		var target = this.spawn;

		if (target)
		{
			//If we're near to the target, either give it our energy or drop it
			if (creep.pos.isNearTo (target)) 
			{
				var notFull = target.energy < target.energyCapacity;
				if (notFull)
				{
					creep.transferEnergy (target);
				}
				else
				{
					creep.dropEnergy ();
				}
			}
			//Let's do the moving
			else 
			{
				creep.moveTo (target);
			}
		}
	}
}

module.exports = MinerHelper;
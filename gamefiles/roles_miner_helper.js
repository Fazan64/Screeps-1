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

MinerHelper.prototype.assignMiner = function () 
{
	var creep = this.creep;

	debugger;
	var miner = this.getClosest (creep.room.myCreeps.filter (function (miner) 
	{
		debugger;
		return miner.memory.role == 'miner' && miner.memory.helpers.length < miner.memory.helpersNeeded;
	}));

	if (!miner)
	{
		return;
	}

	creep.memory.miner = miner.id;
	miner.memory.helpers.push (creep.id);
	
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
	creep.memory.spawn = this.getClosest (creep.room.mySpawns).id;
	creep.memory.id = creep.id;
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
	
	if (creep.memory.courierTarget) 
	{
		creep.moveTo (Game.getObjectById (creep.memory.courierTarget));
		creep.memory.courierTarget = null;
		return;
	}

	// If this helper isn't assigned to a miner, find one and assign him to it. If it is assigned to a miner,
	// then find that miner by his id
	if (creep.memory.miner == undefined)
	{
		this.assignMiner ();
	}
	var miner = Game.getObjectById (creep.memory.miner);
	// If stored id was an id of a dead creep
	if (miner === null)
	{
		this.assignMiner ();
	}

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
		else
		{
			if (miner.memory.isNearSource)
			{
				creep.moveTo (miner);
			}
		}

		return;
	}
	// Okay, everything below is for dropping energy off
	else
	{
		var target = null;

		var spawn = Game.getObjectById (creep.memory.spawn);
		if (!spawn)
		{
			spawn = this.getClosest (creep.room.mySpawns);
			if (spawn)
			{
				creep.memory.spawn = spawn.id;
			}
		}

		//If we found it, set it as our target
		if (spawn)
		{
			target = spawn;
		}
		
		// Get the direction away from target
		// It's a lot less precise without pathfinding but 
		// doing a complete path search is just not worth it
		var directionAway = creep.pos.getDirectionTo (creep.pos.x + creep.pos.x - target.pos.x, creep.pos.y + creep.pos.y - target.pos.y);

		// Let's look for a courier in that direction. We'll check on making sure 
		// they're the same role,
		// if they can hold any energy, 
		// if they're in range and 
		// [EXPERIMENTAL] if going to them doesn't mean going away from target

		// Because usual way to to that seems to be broken
		var courier = creep.pos.findClosestByRange (creep.room.myCreeps.filter (function (possibleTarget)
		{
			return possibleTarget !== creep
				&& possibleTarget.memory.role === creep.memory.role
				&& possibleTarget.carry.energy < possibleTarget.carryCapacity
				&& creep.pos.inRangeTo (possibleTarget, 10)
				&& creep.pos.getDirectionTo (possibleTarget) !== directionAway
				&& creep.pos.getRangeTo (possibleTarget) < creep.pos.getRangeTo (target);
		}));

		//If we found a courier, make that courier our new target
		if (courier !== null && !creep.pos.isNearTo (target)) 
		{
			creep.say ("Found a courier");
			courier.say ("Will be a courier");
			target = courier;
			target.memory.courierTarget = creep.id;
		}

		if (target)
		{
			//If we're near to the target, either give it our energy or drop it
			if (creep.pos.isNearTo (target)) 
			{
				var notFull = target.energy !== undefined ? target.energy < target.energyCapacity : target.carry.energy < target.carryCapacity;
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
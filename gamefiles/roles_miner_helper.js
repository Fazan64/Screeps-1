/**
 * This guys does the other half of energy collection. The miner gets it from the source, and the helper does the
 * transportation. We don't want them just going for the nearest source, as that means that if we have more than one
 * miner, all the helpers will only go for the first miner. To counter this, we assign them to a miner the same way
 * we assign a miner to a source
 */

var helper = 
{

	baseParts : [CARRY, MOVE],

	assignMiner: function () 
	{
		var creep = this.creep;

		var miner = this.getClosest (Game.creeps, {
			filter: function (miner) 
			{
				return miner.memory.role == 'miner' && miner.memory.helpers.length < miner.memory.helpersNeeded;
			}
		});

		if (miner === undefined)
		{
			return;
		}

		creep.memory.miner = miner.id;
		miner.memory.helpers.push (creep.id);
		
		// Tell the room that we now supply it with energy
		var spawn = Game.getObjectById (creep.memory.spawn);
		spawn.room.memory.suppliers [creep.id] = 
		{ 
			supplyPerTick: miner.minedPerTick
		}
	},
	
	onSpawn: function ()
	{
		var creep = this.creep;
		creep.memory.spawn = this.getClosest (Game.spawns).id;
		creep.memory.id = creep.id;
	},
	
	onDeath: function (memory)
	{
		// We no longer supply the room with energy
		var spawn = Game.getObjectById (memory.spawn);
		spawn.room.memory.suppliers [memory.id] = undefined;
		
		if (memory.miner)
		{
			var miner = Game.getObjectByName (memory.miner);
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
	},

	/**
	 * @TODO: Make helpers smarter about avoiding miners, instead of just waiting till they're 5 tiles away
	 * @TODO: When spawns are at .25, and extensions have >= 200, help builders before filling shit up
	 */
	action: function ()
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
		if (creep.energy < creep.energyCapacity) 
		{
			if (creep.pos.isNearTo(miner)) 
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
					creep.moveTo(miner);
				}
			}

			return;
		}

		var target = null;

		//Okay, everything below is for dropping energy off
		var spawn = Game.getObjectById (creep.memory.spawn);
		if (!spawn)
		{
			spawn = this.getClosest (Game.spawns);
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
		//var directionAway = creep.pos.getDirectionTo (creep.pos.x + creep.pos.x - target.pos.x, creep.pos.y + creep.pos.y - target.pos.y);

		// Let's look for a courier in that direction. We'll check on making sure 
		// they're the same role,
		// if they can hold any energy, 
		// if they're in range and 
		// [EXPERIMENTAL] if going to them doesn't mean going away from target

		var courier = creep.pos.findNearest(Game.MY_CREEPS, {
			filter: function (possibleTarget)
			{
				return 
				(
					possibleTarget.memory.role == creep.memory.role
					&& possibleTarget.energy < possibleTarget.energyCapacity
					&& creep.pos.inRangeTo (possibleTarget, 1)
					//&& creep.pos.getDirectionTo (possibleTarget) != directionAway
				);
			}
		});

		//If we found a courier, make that courier our new target
		if (courier !== null && !creep.pos.isNearTo (target)) 
		{
			target = courier;
			target.memory.courierTarget = creep.id;
		}

		if (target)
		{
			//If we're near to the target, either give it our energy or drop it
			if (creep.pos.isNearTo (target)) 
			{
				if (target.energy < target.energyCapacity)
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
};

module.exports = helper;
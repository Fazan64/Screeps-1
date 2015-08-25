var WORK_EFFICIENCY = 2;

/**
 * This guy just finds a source, and stays near it. His job is just to mine away and let the energy fall on the ground
 *
 * @TODO: See if we can't implement preffered spawn spots close to their source
 * @param creep
 */
var miner = 
{
	
	baseParts : [WORK, WORK],

	getOpenSource: function ()
	{
		var creep = this.creep;
		
		// This init should be in a different place
		if (Memory.sources === undefined)
		{
			Memory.sources = {};
		}

		var source = this.getClosest (FIND_SOURCES_ACTIVE, {
			filter: function(source)
			{
				if (Memory.sources [source.id] == undefined || Memory.sources [source.id].miner == undefined || Memory.sources [source.id].miner == creep.id)
				{
					return true;
				}

				if (Game.getObjectById (Memory.sources [source.id].miner) == null)
				{
					return true;
				}

				return false;
			}
		});

		return source;
	},

	setSourceToMine: function (source)
	{
		var creep = this.creep;

		if (!source)
		{
			return;
		}

		if (Memory.sources [source.id] == undefined)
		{
			Memory.sources [source.id] = { id: source.id };
		}

		Memory.sources [source.id].miner = creep.id;
		creep.memory.source = source.id;

		var helperSpawn = source.pos.findClosestByRange (Game.spawns);
		// A heuristic?
		var steps = helperSpawn.pos.getRangeTo(source).length * 3;
		var creepsNeeded = Math.round((steps * 8) / 100);

		if (creepsNeeded > 5)
		{
			creepsNeeded = 5;
		}

		for (var i = 0; i < creepsNeeded; i++)
		{
			source.room.memory.needs.creeps.unshift (
			{ 
				type: 'miner_helper', 
				memory: 
				{
					miner: creep.id
				}
			});
		}

		creep.memory.helpersNeeded = creepsNeeded;

	},

	onSpawn: function ()
	{
		var creep = this.creep;

		creep.memory.isNearSource = false;
		creep.memory.helpers = [];
		
		creep.memory.minedPerTick = creep.getActiveBodyparts (WORK) * WORK_EFFICIENCY;

		var source = this.getOpenSource ();
		if (source)
		{
			creep.say ("Source found!");
			this.setSourceToMine (source);
		}	
		else
		{
			creep.say ("No open sources!");
		}
	},
	
	onDeath: function (memory)
	{
		if (memory.source !== undefined)
		{
			var source = Game.getObjectById (memory.source);
			if (source)
			{
				source.memory.miner = null;
			}
		}
		
		memory = undefined;
	},

	action: function()
	{
		var creep = this.creep;

		// Basically, each miner can empty a whole source by themselves. Also, since they're slow, we don't have them
		// moving away from the source when it's empty, it'd regenerate before they got to another one.
		// For this, we assign one miner to one source, and they stay with it
		var source = Game.getObjectById (creep.memory.source);

		if (source == null) 
		{
			creep.say ("I have no source assigned, searching...");
			var source = this.getOpenSource ();

			if (!source)
			{
				creep.say ("No open sources!");
				return;
			}
			
			creep.say ("Source found!");
			this.setSourceToMine (source);
		}

		creep.memory.isNearSource = creep.pos.inRangeTo (source, 5);

		this.moveAndPerform (source, creep.harvest);
	}
};

module.exports = miner;
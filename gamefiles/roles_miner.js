var WORK_EFFICIENCY = 2;

function isFreeSource (source)
{
	if (Memory.sources [source.id] == undefined || Memory.sources [source.id].miner == undefined || Memory.sources [source.id].miner == this.creep.id)
	{
		return true;
	}

	if (Game.getObjectById (Memory.sources [source.id].miner) == null)
	{
		return true;
	}

	return false;
}

var ProtoRole = require ("role_prototype");

/**
 * This guy just finds a source, and stays near it. His job is just to mine away and let the energy fall on the ground
 * @TODO: See if we can't implement preffered spawn spots close to their source
 * @class
 * @constructor
 */
function Miner () { ProtoRole.apply (this, arguments) }

Miner.prototype = Object.create (ProtoRole.prototype);

Miner.prototype.baseParts = [WORK, WORK];

Miner.prototype.getOpenSource = function ()
{
	var creep = this.creep;
		
	// This init should be in a different place
	if (!Memory.sources)
	{
		Memory.sources = {};
	}

	var source = this.getClosest (creep.room.sourcesActive.filter (isFreeSource, this));

	return source;
}

Miner.prototype.setSourceToMine = function (source)
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

	var helperSpawn = source.pos.findClosestByRange (source.room.mySpawns);
	var steps = helperSpawn.pos.findPathTo (source).length * 2;
	var creepsNeeded = Math.round((steps * 8) / 100);

	if (creepsNeeded > 5)
	{
		creepsNeeded = 5;
	}

	creep.memory.helpersNeeded = creepsNeeded;

}

Miner.prototype.onStart = function ()
{
	var creep = this.creep;
	console.log ("executing onStart...");

	creep.memory.isNearSource = false;
	creep.memory.helpers = [];
	
	creep.memory.minedPerTick = creep.getActiveBodyparts (WORK) * WORK_EFFICIENCY;

	var source = this.getOpenSource ();
	if (source)
	{
		console.log ("Source found!");
		this.setSourceToMine (source);
	}	
	else
	{
		console.log ("No open sources!");
	}
}

Miner.prototype.onDeath = function (memory)
{
	if (memory.source !== undefined)
	{
		var source = Game.getObjectById (memory.source);
		if (source)
		{
			Memory.sources [source.id].miner = null;
		}
	}
}

Miner.prototype.action = function ()
{
	var creep = this.creep;

	// Basically, each miner can empty a whole source by themselves. Also, since they're slow, we don't have them
	// moving away from the source when it's empty, it'd regenerate before they got to another one.
	// For this, we assign one miner to one source, and they stay with it
	var source = Game.getObjectById (creep.memory.source);

	if (source == null) 
	{
		creep.say ("I have no source assigned, searching...");
		source = this.getOpenSource ();

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

module.exports = Miner;
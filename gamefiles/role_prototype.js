var calculateCost = require ('calculateCost');
var MAX_PARTS = 30;

var directions = 
{
	1 : {x : 0, y : -1},
	2 : {x : 1, y : -1},
	3 : {x : 1, y : 0},
	4 : {x : 1, y : 1},
	5 : {x : 0, y : 1},
	6 : {x : -1, y : 1},
	7 : {x : -1, y: 0},
	8 : {x : -1, y : -1},
}

function notSourceKeeper (enemy)
{
	return enemy.owner.username !== "Source Keeper";
}

function isInRangedAttackRange (enemy) 
{ 
	return enemy.pos.inRangeTo (this.creep, 3);
}

function isArcher (enemy) 
{
	return enemy.getActiveBodyparts (RANGED_ATTACK) > 0;
}

function isMobileMelee (enemy) 
{
	return enemy.getActiveBodyparts (ATTACK) > 0
		&& enemy.getActiveBodyparts (MOVE) > 0;
}

function isMobileHealer (enemy) 
{
	return enemy.getActiveBodyparts (HEAL) > 0
		&& enemy.getActiveBodyparts (MOVE) > 0;
}

function isPathBlocked (pos, direction)
{
	var dir = directions [direction];
	var targetPos = new RoomPosition (pos.x + dir.x, pos.y + dir.y, pos.roomName);
	
	var creeps = targetPos.lookFor ('creep');
	return creeps.length || targetPos.lookFor ('terrain') [0] === 'wall';
}

/**
 * @class
 * @constructor
 */
function ProtoRole ()
{
	this._cache = {};
}

ProtoRole.prototype.reset = function ()
{
	this.creep = null;
	this._cache = {};
	// Sets all properties that start with '_' (except _cache) to null
	for (var propertyName in this) 
	{
		if (propertyName !== "_cache" && propertyName.indexOf ('_') == 0)
		{
			this [propertyName] = null;
		}
	}
}

/**
* Set the creep for this role
*
* @param {Creep} creep
*/
ProtoRole.prototype.setCreep = function (creep)
{
	this.creep = creep;
}

ProtoRole.prototype.run = function ()
{
		
	if (this.creep.memory.onStarted == undefined)
	{
		this.onStart ();
		this.creep.memory.onStarted = true;
	}
	
	if (this.creep.memory.onSpawned == undefined && !this.creep.spawning) 
	{
		this.onSpawn ();
		this.creep.memory.onSpawned = true;
	}

	if (!this.creep.spawning)
	{
		this.action ();
	}

	if (this.creep.ticksToLive == 1)
	{
		this.beforeAge ();
	}
}

/**
* Generates a biggest creep body made from 'baseParts'
* affordable for 'maxEnergy' 
* 
* @param maxEnergy : {Number}
*/
ProtoRole.prototype.getParts = function (maxEnergy)
{
	if (maxEnergy === undefined)
	{
		maxEnergy = 300;
	}
	
	var baseBody = [];
	baseBody = baseBody.concat (this.baseParts);

	// Add enough MOVE parts to let it move at half the max speed
	for (var i = 0; i < this.baseParts.length / 2; i++) 
	{
		baseBody.push (MOVE);
	}

	// How many baseBodys we can produce with maxEnergy
	var times = Math.floor (maxEnergy / calculateCost(baseBody));

	// If there are more parts than maximum, lower the 'times' accordingly
	if (times * baseBody.length > MAX_PARTS)
	{
		times = Math.floor (MAX_PARTS / baseBody.length);
	}
	else if (times == 0)
	{
		return [];
	}

	// Construct a finalBody out of 'times' baseBodys, which is the biggest body affordable for the maxEnergy
	var finalBody = [];
	for (var i = 0; i < times; i++)
	{
		finalBody = finalBody.concat(baseBody);
	}

	console.log ('    ---------------');
	console.log ('    baseBody cost: '  + calculateCost(baseBody));
	console.log ('    maximum energy: ' + maxEnergy);
	console.log ('    finalBody: '      + finalBody);
	console.log ('    ---------------');
	return finalBody;
}

ProtoRole.prototype.action = function () {}

ProtoRole.prototype.onStart = function () {}

ProtoRole.prototype.onSpawn = function () {}

ProtoRole.prototype.beforeAge = function () {}

/** 
* Note: when this is called, the creep itself
* doesn't exist anymore, so this.creep == null,
* but the memory of the deceased is still there.
*/
ProtoRole.prototype.onDeath = function () {}

ProtoRole.prototype.routeCreep = function (target)
{
	var creep = this.creep;
	
	if (creep.fatigue > 0 || !target) 
	{
		return -1;
	}

	var targetId = target.id;
	var posStr = creep.room.name + "." + creep.pos.x + "." + creep.pos.y;
	
	var routeCache = Memory.routeCache = Memory.routeCache || {};
	
	if (routeCache [targetId])
	{
		// If the target moved since the last pathfinding.
		// Done like this since isEqualTo returns false for some reason.
		if (routeCache [targetId].lastPosition.inRangeTo (target.pos, 0))
		{
			delete routeCache [targetId];
		}
	}
	routeCache [targetId] = routeCache [targetId] || { origins : {}, lastPosition : target.pos, established : Game.time };
	routeCache [targetId].lastPosition = target.pos;
	
	if (!routeCache [targetId].origins [posStr]) 
	{
		routeCache [targetId].origins [posStr] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
		
		var path = creep.room.findPath (creep.pos, target.pos, { maxOps: 500, heuristicWeight: 2 })
		
		// If path found, fill the cache with it
		if (path && path.length) 
		{
			routeCache [targetId].origins [posStr] [path [0].direction] += 1;

			for (var i = 0; i < path.length - 1; i++) 
			{
				var step = path [i];
				var stepStr = creep.room.name + "." + step.x + "." + step.y;
				
				routeCache [targetId].origins [stepStr] = routeCache [targetId].origins [stepStr] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
				
				routeCache [targetId].origins [stepStr] [path [i + 1].direction] += 1;
			}
		}
		// Otherwise pick random direction
		else 
		{
			var dir = Math.floor (Math.random () * 8);
			return creep.move (dir);;
		}
	}

	/*
	// Clean out invalid routes
	for (var k in routeCache) 
	{
		if (Game.getObjectById (k) == null) 
		{
			delete routeCache [k];
		}
	}
	*/

	var total = 0;
	//pick from the weighted list of steps
	for (var d in routeCache [targetId].origins [posStr]) 
	{
		total +=  routeCache [targetId].origins [posStr] [d];
	}
	
	total *= Math.random();
	
	var dir = 0;
	for (var d in routeCache [targetId].origins [posStr]) 
	{
		total -=  routeCache [targetId].origins [posStr] [d];
		if (total < 0) 
		{
			dir = d;
			break;
		}
	}
	
	if (creep.pos.getRangeTo(target) > 1 && isPathBlocked (creep.pos, dir)) 
	{
		dir = Math.floor (Math.random() * 8);
	}
	
	return creep.move (dir);
}

ProtoRole.prototype.moveTo = function (target)
{
	this.routeCreep (target);
	//this.creep.moveTo (target, { reusePath : 5 });
}

ProtoRole.prototype.moveAndPerform = function (target, action)
{
	if (!(action instanceof Function))
	{
		throw new Error ("role_prototype.moveAndPerform: 'action' is not a function!");
	}
	
	var creep = this.creep;
	if (!creep.pos.isNearTo (target))
	{
		this.moveTo (target);
	}
	else 
	{
		action.call (creep, target);
	}
}

/**
* A version of pos.findClosestByRange that uses caching
*/
ProtoRole.prototype.getClosest = function (type, opts)
{
	// TODO: make it use caching even with filter:
	// cache only search by type, and filter the 
	// cached result if needed
	
	// If options are given, or we should get closest from 
	// an array of objects then calculate without caching
	// since I see no way to include a custom object or 
	// an array in caching index
	if (opts !== undefined || type instanceof Array)
	{
		return this.creep.pos.findClosestByRange (type, opts);
	}
	
	// Else (a search spec, FIND_MY_CREEPS for example), use caching
	if (this._cache [type])
	{
		return this._cache [type];
	}
	
	this._cache [type] = this.creep.pos.findClosestByRange (type);
	return this._cache [type];
}

ProtoRole.prototype.rest = function (civilian)
{
	var creep = this.creep;

	var distance = 4;
	var restTarget = null;
	
	if (civilian)
	{
		var flags = Game.flags;
		for (var i in flags)
		{
			var flag = flags[i];
			// If the flag is red & its position is free
			if (flag.color == COLOR_WHITE &&
				(creep.pos.inRangeTo (flag, distance) || creep.pos.getRangeTo (flag) > 0)
			) 
			{
				restTarget = flag;
				break;
			}
		}
		
		if (!restTarget)
		{
			restTarget = this.getClosest (creep.room.mySpawns);
		}
	}
	else
	{
		var flags = Game.flags;
		for (var i in flags)
		{
			var flag = flags[i];
			// If the flag is red & its position is free
			if (flag.color == COLOR_RED &&
				(creep.pos.inRangeTo (flag, distance) || creep.pos.getRangeTo (flag) > 0)
			) 
			{
				restTarget = flag;
				break;
			}
		}
	}
	
	if (!restTarget)
	{
		restTarget = creep.pos;
	}

	this.moveTo (restTarget);
}

ProtoRole.prototype.getRangedTarget = function ()
{
	var creep = this.creep;
		
	var hostiles = creep.room.hostileCreeps.filter (notSourceKeeper);
	
	if (hostiles && hostiles.length)
	{
		hostiles.sort (function (a, b)
		{
			return creep.pos.getRangeTo (a) - creep.pos.getRangeTo (b);	
		});
		
		var closeEnemies = hostiles.filter (isInRangedAttackRange, this);
		
		if (closeEnemies && closeEnemies.length)
		{
			
			var closeArchers = closeEnemies.filter (isArcher);
	
			if (closeArchers.length)
			{
				return closeArchers [0];
			}
			
			var closeMobileMelee = closeEnemies.filter (isMobileMelee);
	
			if (closeMobileMelee.length)
			{
				return closeMobileMelee [0];
			}
			
			var closeMobileHealers = closeEnemies.filter (isMobileHealer);
	
			if (closeMobileHealers.length)
			{
				return closeMobileHealers [0];
			}
	
			return closeEnemies [0];
		}
		
		return hostiles [0];
	}
	
	return null;
}

ProtoRole.prototype.rangedAttack = function (target)
{
	var creep = this.creep;

	if (!target)
	{
		target = this.getRangedTarget ();
	}

	if (target) 
	{
		if (target.pos.inRangeTo (creep.pos, 3) )
		{
			console.log ("    Performing ranged attack....");
			creep.rangedAttack (target);
			return target;
		}
	}
	return null;
}

ProtoRole.prototype.moveAwayFrom = function (target)
{
	var creep = this.creep;
	creep.move (creep.pos.getDirectionTo (creep.pos.x + creep.pos.x - target.pos.x, creep.pos.y + creep.pos.y - target.pos.y));
}

ProtoRole.prototype.keepAwayFromEnemies = function ()
{
	var creep = this.creep;

	var target = this.getClosest (creep.room.hostileCreeps);
	if (target !== null && target.pos.inRangeTo (creep.pos, 3))
	{
		this.moveAwayFrom (target);
	}
}

ProtoRole.prototype.kite = function (target)
{
	var creep = this.creep;

	console.log ("    Kiting...");
	if (target.pos.getRangeTo (creep.pos) <= 2) 
	{
		this.moveAwayFrom (target);
		return true;
	} 
	else if (target.pos.inRangeTo (creep.pos, 3))
	{
		return true;
	}
	else
	{
		this.moveTo (target);
		return true;
	}

	return false;
}

//module.exports = proto;
module.exports = ProtoRole;
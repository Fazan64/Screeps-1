var calculateCost = require ('calculateCost');
var MAX_PARTS = 30;

var proto =
{
	
	/**
	 * For optimization
	 */
	_cache : {},
	
	/**
	 * The creep for this role
	 *
	 * @type creep
	 */
	creep: null,

	/**
	 * Set the creep for this role
	 *
	 * @param {Creep} creep
	 */
	setCreep: function(creep)
	{
		this.creep = creep;
		return this;
	},

	run: function()
	{
		if(this.creep.memory.onSpawned == undefined) 
		{
			this.onSpawn();
			this.creep.memory.onSpawned = true;
		}

		this.action(this.creep);

		if(this.creep.ticksToLive == 1)
		{
			this.beforeAge();
		}
	},

	handleEvents: function()
	{
		if(this.creep.memory.onSpawned == undefined) 
		{
			this.onSpawnStart();
			this.onSpawn();
			this.creep.memory.onSpawned = true;
		}

		if(this.creep.memory.onSpawnEnd == undefined && !this.creep.spawning) 
		{
			this.onSpawnEnd();
			this.creep.memory.onSpawnEnd = true;
		}
	},

	/**
	 * Generates a biggest creep bneedsody made from 'baseParts'
 	 * affordable for 'maxEnergy' 
	 * 
	 * @param maxEnergy : {Number}
	 */
	getParts: function (maxEnergy)
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
			baseBody.push(MOVE);
		}
    
		// How many baseBodys we can produce with maxEnergy
		var times = Math.floor (maxEnergy / calculateCost(baseBody));
    
		// If there are more parts than maximum, lower the 'times' accordingly
		if (times * baseBody.length > MAX_PARTS)
		{
			times = Math.floor(MAX_PARTS / baseBody.length);
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
    
		//console.log ('---------------');
		//console.log ('baseBody cost: '  + calculateCost(baseBody));
		//console.log ('maximum energy: ' + maxEnergy);
		//console.log ('finalBody: '      + finalBody);
		//console.log ('---------------');
		return finalBody;
	},

	action: function() { },

	onSpawn: function() { },

	onSpawnStart: function() { },

	onSpawnEnd: function() { },

	beforeAge: function() { },
	
	/**
	 * Either performs an action 'action' to a target 'target', 
	 * or moves to 'target' until nearTo it.
	 * For example: "moveAndPerform (target, creep.attack)"
	 */
	moveAndPerform (target, action)
	{
		if (!(action instanceof Function))
		{
			throw new Error ("role_prototype.moveAndPerform: 'action' is not a function!");
		}
		
		var creep = this.creep;
		if (!creep.pos.isNearTo (target))
		{
			creep.moveTo (target);
		}
		else 
		{
			action.call (creep, target);
		}
		
	},
	
	getClosest: function (type)
	{
		// If an array of objects is given
		if (type instanceof Array)
		{
			return this.creep.pos.findClosestByRange (type);
		}
		// Else
		if (this._cache [type])
		{
			return this._cache [type];
		}
		this._cache [type] = this.creep.pos.findClosestByRange (type);
		
	},

	rest: function (civilian)
	{
		var creep = this.creep;

		var distance = 4;
		var restTarget = creep.pos;
		
		if (civilian)
		{
			restTarget = creep.pos.findClosestByRange (Game.spawns);
		}
		else
		{
			var flags = Game.flags;
			for (var i in flags)
			{
				var flag = flags[i];
				// If the flag is red & its position is free
				if (flag.color == COLOR_RED &&
				    (creep.pos.inRangeTo(flag, distance) || creep.pos.getRangeTo(flag) > 0)
				) 
				{
					restTarget = flag;
					break;
				}
			}
		}

		creep.moveTo (restTarget);
	},

	rangedAttack: function(target)
	{
		var creep = this.creep;

		if(!target)
		{
			target = this.getClosest (FIND_HOSTILE_CREEPS);
		}

		if(target) 
		{
			if (target.pos.inRangeTo (creep.pos, 3) )
			{
				creep.rangedAttack (target);
				return target;
			}
		}
		return null;
	},
	
	moveAwayFrom: function (target)
	{
		var creep = this.creep;
		creep.move (creep.pos.getDirectionTo (creep.pos.x + creep.pos.x - target.pos.x, creep.pos.y + creep.pos.y - target.pos.y));
	},

	keepAwayFromEnemies: function()
	{
		var creep = this.creep;

		var target = this.getClosest (FIND_HOSTILE_CREEPS);
		if (target !== null && target.pos.inRangeTo (creep.pos, 3))
		{
			this.moveAwayFrom (target);
		}
	},

	/**
	 * Makes a creep keep a distance of 3 to the 'target'
	 */
	kite: function(target) 
	{
		var creep = this.creep;

		if (target.pos.inRangeTo (creep.pos, 2)) 
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
			creep.moveTo (target);
			return true;
		}

		return false;
	},

	getRangedTarget: function()
	{
		var creep = this.creep;
		
		var hostiles = creep.room.find (FIND_HOSTILE_CREEPS);
		
		var closeEnemies = hostiles.filter (function (enemy) { 
			return creep.pos.inRangeTo (enemy, 3); 
		});
		
		if (closeEnemies)
		{
			var closeArchers = closeEnemies.filter (function (enemy) {
				return enemy.getActiveBodyparts (RANGED_ATTACK) > 0;
			});
	
			if (closeArchers !== null)
			{
				return closeArchers [0];
			}
			
			var closeMobileMelee = closeEnemies.filter (function (enemy) {
				return enemy.getActiveBodyparts(ATTACK) > 0
					&& enemy.getActiveBodyparts(MOVE) > 0;
			});
	
			if (closeMobileMelee !== null)
			{
				return closeMobileMelee [0];
			}
			
			var closeMobileHealers = closeEnemies.filter (function (enemy) {
				return enemy.getActiveBodyparts(HEAL) > 0
					&& enemy.getActiveBodyparts(MOVE) > 0;
			});
	
			if (closeMobileHealers !== null)
			{
				return closeMobileHealers [0];
			}
	
			return closeEnemies [0];
		}
		
		return null;
	}
};

module.exports = proto;
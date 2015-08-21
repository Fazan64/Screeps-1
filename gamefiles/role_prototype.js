var calculateCost = require ('calculateCost');
var MAX_PARTS = 30;

var proto = {
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
	 * All credit goes to Djinni
	 * @url https://bitbucket.org/Djinni/screeps/
	 */
	rest: function(civilian)
	{
		var creep = this.creep;

		var distance = 4;
		var restTarget = creep.pos.findNearest(Game.MY_SPAWNS);

		if(!civilian) {
			var flags = Game.flags;
			for (var i in flags) {
				var flag = flags[i];
				if (creep.pos.inRangeTo(flag, distance) || creep.pos.findPathTo(flag).length > 0) {
					restTarget = flag;
					break;
				}
			}
		}

//		var flag = Game.flags['Flag1'];
//		if(flag !== undefined && civilian !== true)
//			restTarget = flag;
//
//		var flag2 = Game.flags['Flag2'];
//		if(flag !== undefined && civilian !== true && !creep.pos.inRangeTo(flag, distance) && !creep.pos.findPathTo(flag).length)
//			restTarget = flag2;

		if (creep.getActiveBodyparts(Game.HEAL)) {
//			distance = distance - 1;
		}
		else if (creep.getActiveBodyparts(Game.RANGED_ATTACK)) {
//			distance = distance - 1;
		}
		if (creep.pos.findPathTo(restTarget).length > distance) {
			creep.moveTo(restTarget);
		}
	},

	/**
	 * All credit goes to Djinni
	 * @url https://bitbucket.org/Djinni/screeps/
	 */
	rangedAttack: function(target) {
		var creep = this.creep;

		if(!target)
			target = creep.pos.findNearest(Game.HOSTILE_CREEPS);

		if(target) {
			if (target.pos.inRangeTo(creep.pos, 3) ) {
				creep.rangedAttack(target);
				return target;
			}
		}
		return null;
	},

	keepAwayFromEnemies: function()
	{
		var creep = this.creep;

		var target = creep.pos.findNearest(Game.HOSTILE_CREEPS);
		if(target !== null && target.pos.inRangeTo(creep.pos, 3))
			creep.moveTo(creep.pos.x + creep.pos.x - target.pos.x, creep.pos.y + creep.pos.y - target.pos.y );
	},

	/**
	 * All credit goes to Djinni
	 * @url https://bitbucket.org/Djinni/screeps/
	 */
	kite: function(target) {
		var creep = this.creep;

		if (target.pos.inRangeTo(creep.pos, 2)) {
			creep.moveTo(creep.pos.x + creep.pos.x - target.pos.x, creep.pos.y + creep.pos.y - target.pos.y );
			return true;
		} else if (target.pos.inRangeTo(creep.pos, 3)) {
			return true;
		}
		else {
			creep.moveTo(target);
			return true;
		}

		return false;
	},

	getRangedTarget: function()
	{
		var creep = this.creep;

		var closeArchers = creep.pos.findNearest(Game.HOSTILE_CREEPS, {
			filter: function(enemy)
			{
				return enemy.getActiveBodyparts(Game.RANGED_ATTACK) > 0
					&& creep.pos.inRangeTo(enemy, 3);
			}
		});

		if(closeArchers != null)
			return closeArchers;

		var closeMobileMelee = creep.pos.findNearest(Game.HOSTILE_CREEPS, {
			filter: function(enemy)
			{
				return enemy.getActiveBodyparts(Game.ATTACK) > 0
					&& enemy.getActiveBodyparts(Game.MOVE) > 0
					&& creep.pos.inRangeTo(enemy, 3);
			}
		});

		if(closeMobileMelee != null)
			return closeMobileMelee;

		var closeHealer = creep.pos.findNearest(Game.HOSTILE_CREEPS, {
			filter: function(enemy)
			{
				return enemy.getActiveBodyparts(Game.HEAL) > 0
					&& enemy.getActiveBodyparts(Game.MOVE) > 0
					&& creep.pos.inRangeTo(enemy, 3);
			}
		});

		if(closeHealer != null)
			return closeHealer;

		return creep.pos.findNearest(Game.HOSTILE_CREEPS);
	}
};

module.exports = proto;
var upgrader = 
{
	baseParts : [WORK, CARRY],

	onStart: function ()
	{
		var creep = this.creep;
		
		creep.memory.id = creep.id;
		
		if (creep.room.controller)
		{
			creep.memory.controller = creep.room.controller.id;
		}
		
		// Since this is called when the creep is still being spawned so there is definitely a spawn at this creeps position
		var spawn = creep.room.lookForAt ('structure', creep.pos).filter (function (structure) { return structure.type == STRUCTURE_SPAWN }) [0];
		// If something goes terribly wrong
		if (!spawn)
		{
			spawn = creep.room.mySpawns [0];
		}
		creep.memory.spawn = spawn.id;
		
		creep.room.memory.upgraders [creep.id] = 
		{
			upgradePerTick : creep.getActiveBodyparts (WORK) * 2
		}
	},
	
	onDeath: function (memory)
	{
		// We no longer supply the room with energy
		var spawn = Game.getObjectById (memory.spawn);
		delete spawn.room.memory.upgraders [memory.id];
	},
	
	action: function ()
	{
		var creep = this.creep;
		
		var controller = Game.getObjectById (creep.memory.controller);
		 
		if (creep.carry.energy > 0)
		{
			this.moveAndPerform (controller, creep.upgradeController);
		}
		else
		{
			var spawn = Game.getObjectById (creep.memory.spawn);
			creep.moveTo (spawn);
			spawn.transferEnergy (creep);
		}
	}
};

module.exports = upgrader;
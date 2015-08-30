var SAFEMODE = false;
var roleManager = require ('roleManager');

module.exports = function (creeps)
{
	//For each creep, check if they have a role. If they do, load and run it
	for (var name in creeps)
	{
		var creep = creeps[name];
		if (creep.memory.role == undefined || (creep.memory.active !== undefined && !creep.memory.active))
			continue;

		var role = creep.memory.role;

		var roleObject = null;
		if (roleManager.roleExists (role))
		{
			roleObject = roleManager.getRoleObject (role);

			roleObject.setCreep (creep);
			if (SAFEMODE)
			{
				try 
				{ 
					roleObject.run ();
				} 
				catch(e) 
				{ 
					console.log ("Error while executing role behaviour: " + role + " " + creep.name);
					console.log (e)	
				};
			}
			else
			{
				roleObject.run ();
			}
		}
		
		creep.memory.lastAliveTime = Game.time;
		
	}
	
	// Now we check if any creeps have died
	for (var i in Memory.creeps) 
	{
		var creepMemory = Memory.creeps [i];
		
		// If so, get an appropriate roleObject and execute it's deathHandler
		if (!Game.creeps [i] && creepMemory.lastAliveTime == Game.time - 1) 
		{
			console.log (i + " has died :( handling...");
			
			roleObject = null;
			if (roleManager.roleExists (creepMemory.role)) 
			{
				roleObject = roleManager.getRoleObject (creepMemory.role);
				roleObject.onDeath (creepMemory);
				delete Memory.creeps [i].memory;
			}
		}
	}
};
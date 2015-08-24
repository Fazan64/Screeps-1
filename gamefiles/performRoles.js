var roleManager = require('roleManager');

module.exports = function(creeps)
{
	//For each creep, check if they have a role. If they do, load and run it
	for(var name in creeps)
	{
		var creep = creeps[name];
		if(creep.spawning || creep.memory.role == undefined || (creep.memory.active !== undefined && !creep.memory.active))
			continue;

		var role = creep.memory.role;

		if (roleManager.roleExists(role))
		{
			role = roleManager.getRole(role);
		}

		var role = Object.create (role);
		role.setCreep (creep);
		try 
		{ 
			role.run ();
			console.log ("Performing role behaviour for creep " + creep.name + "..."); 
		} 
		catch(e) 
		{ 
			console.log (e)	
		};
	}
};
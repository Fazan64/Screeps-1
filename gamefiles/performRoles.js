var roleManager = require('roleManager');

module.exports = function(creeps)
{
	//For each creep, check if they have a role. If they do, load and run it
	for (var name in creeps)
	{
		var creep = creeps[name];
		if (creep.spawning || creep.memory.role == undefined || (creep.memory.active !== undefined && !creep.memory.active))
			continue;

		var role = creep.memory.role;

		if (roleManager.roleExists (role))
		{
			role = roleManager.getRole (role);
		}

		var roleObject = Object.create (role);
		roleObject.setCreep (creep);
		try 
		{ 
			roleObject.run ();
		} 
		catch(e) 
		{ 
			console.log (e)	
		};
	}
};
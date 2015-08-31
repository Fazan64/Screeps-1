Memory.rolesCache = Memory.rolesCache || {};

module.exports = 
{
	roleExists: function (role)
	{
		if (!Memory.rolesCache [role])
		{
			try
			{
				var RoleConstructor =  require ("roles_" + role);
				var roleObject = new RoleConstructor ();
				Memory.rolesCache [role] = roleObject;
			}
			catch(e) {console.log ("roleManager: error: " + e)}
		}
		return Memory.rolesCache [role] !== undefined;
	},

	getRoleObject: function (role)
	{
		if (!this.roleExists(role))
		{
			return false;
		}

		var roleObject = Memory.rolesCache [role];
		return Object.create (roleObject);
	},

	getRoleBodyParts: function (role, maxEnergy)
	{
		if (!this.roleExists(role))
		{
			return false;
		}

		var roleObject = this.getRoleObject (role);

		if (roleObject.getParts !== undefined)
		{
			return roleObject.getParts.call (roleObject, maxEnergy);
		}
		else
		{
			return roleObject.prototype.getParts.call (roleObject, maxEnergy);
		}
	}
};
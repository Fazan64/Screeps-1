var rolesCache = {};

module.exports = 
{
	roleExists: function (role)
	{
		if (rolesCache [role] === undefined)
		{
			try
			{
				var RoleConstructor = require ("roles_" + role);
				rolesCache [role] = new RoleConstructor ();
			}
			catch(e) 
			{
				rolesCache [role] = null;
			}
		}
		// casting to bool (true if rolesCache isn't undefined or null)
		return !!rolesCache [role];
	},

	getRoleObject: function (role)
	{
		if (!this.roleExists(role))
		{
			return false;
		}

		return rolesCache [role];
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
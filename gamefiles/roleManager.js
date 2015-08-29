var rolesCache = {};

module.exports = 
{
	roleExists: function (role)
	{
		if (!rolesCache [role])
		{
			try
			{
				debugger;
				rolesCache [role] = require ("roles_" + role);
				debugger;
			}
			catch(e) {}
		}
		return rolesCache [role] !== undefined;
	},

	getRoleObject: function (role)
	{
		if (!this.roleExists(role))
		{
			return false;
		}

		var Role = rolesCache [role];
		return new Role ();
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
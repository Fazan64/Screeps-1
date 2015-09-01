var rolesCache = {};

module.exports = 
{
	roleExists: function (role)
	{
		if (!rolesCache [role])
		{
			try
			{
				var RoleConstructor = require ("roles_" + role);
				rolesCache [role] = new RoleConstructor ();
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
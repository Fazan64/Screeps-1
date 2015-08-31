Memory.rolesCache = Memory.rolesCache || {};

module.exports = 
{
	roleExists: function (role)
	{
		if (!Memory.rolesCache [role])
		{
			try
			{
				Memory.rolesCache [role] = require ("roles_" + role);
			}
			catch(e) {}
		}
		return Memory.rolesCache [role] !== undefined;
	},

	getRoleObject: function (role)
	{
		if (!this.roleExists(role))
		{
			return false;
		}

		var Role = Memory.rolesCache [role];
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
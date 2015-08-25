var protoRole = require ('role_prototype');
var extend = require ('extend');

var rolesCache = {};

module.exports = 
{
	roleExists: function (role)
	{
		if (!rolesCache [role])
		{
			try
			{
				rolesCache [role] = require ("roles_" + role);
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

		var roleObject = rolesCache [role];
        roleObject = extend (roleObject, protoRole);
		return Object.create (roleObject);
	},

	getRoleBodyParts: function (role, maxEnergy)
	{
		if (!this.roleExists(role))
		{
			return false;
		}

		var roleObject = this.getRole (role);

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
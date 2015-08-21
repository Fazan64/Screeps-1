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
				rolesCache [role] = require("roles_" + role);
			}
			catch(e)
			{
				rolesCache [role] = false;
			}
		}
		return rolesCache [role] !== undefined;
	},

	getRole: function (role)
	{
		if(!this.roleExists(role))
		{
			return false;
		}

		var roleObject = rolesCache [role];
        roleObject = extend (roleObject, protoRole);
		return roleObject;
	},

	getRoleBodyParts: function (role)
	{
		if(!this.roleExists(role))
		{
			return false;
		}

		var role = this.getRole(role);

		if (role.getParts !== undefined)
		{
			return role.getParts.call(role);
		}
		else
		{
			return role.prototype.getParts.call(role);
		}
	}
};
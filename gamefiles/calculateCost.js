var COST            = {};
COST [MOVE]          = 50;
COST [WORK]          = 100;
COST [CARRY]         = 50;
COST [ATTACK]        = 80;
COST [RANGED_ATTACK] = 150;
COST [HEAL]          = 250;
COST [TOUGH]         = 10;

/**
 * Calculates the energy cost of a Creep with bodyparts 'parts'
 * 
 * @param parts
 * @returns {Number}
 */
module.exports = function (parts)
{
    var cost = 0;
    for (var i in parts)
    {
        var part = parts[i];
        if (COST[part])
        {
            cost += COST[part];
        }
    }
    return cost;
}
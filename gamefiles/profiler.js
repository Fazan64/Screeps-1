/**
 * Based on Actium's profiler:
 * http://support.screeps.com/hc/communities/public/questions/201375902-Profiling
 * 
 */
 
var ENABLE_PROFILING = true;

Memory.profiling = Memory.profiling || {};

function wrap (object, funcName)
{
    // An object is given, so wrap all of its 
    // public (not starting with '_') functions
    if (!funcName)
    {
        for (var propName in object)
        {
            // Doesn't start with '_' and is a function
            if (propName.indexOf ('_') !== 0 && object [propName] instanceof Function)
            {
               wrap (object, propName); 
            }
        }
        return;
    }
    
    if (object [funcName])
    {
        var profilingData = Memory.profiling [funcName] = Memory.profiling [funcName] || { usage: 0, count: 0 }
        
        object [funcName] = function () 
        {
            var usedBefore = Game.getUsedCpu ();
            var returnValue = object [funcName].apply (this, arguments);
            profilingData.usage += Game.getUsedCpu () - usedBefore;
            profilingData.count++;
            return returnValue;
        }
    }
}

/*
function getWrapper (func, funcName)
{
    var profilingData = Memory.profiling [funcName] = Memory.profiling [funcName] || { usage: 0, count: 0 }
    return function ()
    {
        var usedBefore = Game.getUsedCpu ();
        
        var returnValue = func.apply (this, arguments);
        
        profilingData.usage += Game.getUsedCpu () - usedBefore;
        profilingData.count++;
        return returnValue;
    }
}
*/

function report ()
{
    var summary = 0;
    for (var functionName in Memory.profiling)
    {
        var profilingData = Memory.profiling [functionName];
        
        if (profilingData.count === 0) 
        {
            profilingData.average = 0;
            continue;
        }
        
        profilingData.average = profilingData.usage / profilingData.count;
        summary += profilingData.average;
    }

    for (var functionName in Memory.profiling) 
    {
        profilingData = Memory.profiling [functionName];
        
        console.log (functionName + ': ' + profilingData.usage.toFixed (2) + '/' + profilingData.count + ' == ' + profilingData.average.toFixed (2)
                    + ' (' + (profilingData.average * 100 / summary).toFixed (2) + '%)');
    }
    console.log ('--- ' + summary.toFixed (2));

    Memory.profiling = {};
}

if (ENABLE_PROFILING) 
{
    wrap (RoomPosition, 'isNearTo');
    wrap (RoomPosition, 'findPathTo');
    wrap (RoomPosition, 'isEqualTo');
    wrap (RoomPosition, 'findClosest');
    wrap (Creep, 'moveByPath');
    wrap (Creep, 'moveTo');
    wrap (Creep, 'pickup');
    wrap (Creep, 'build');
    wrap (Creep, 'repair');
    wrap (Creep, 'harvest');
    wrap (Creep, 'upgradeController');
    wrap (Room, 'lookForAt');
    wrap (Room, 'find');
    wrap (Spawn, 'createCreep');
}

module.exports = 
{
	wrap : wrap,
    report : report
}
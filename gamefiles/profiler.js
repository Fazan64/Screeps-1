/**
 * Based on Actium's profiler:
 * http://support.screeps.com/hc/communities/public/questions/201375902-Profiling
 *
 * Output: 
 * "summary" is a sum of "average per use" values of all tracked functions since the last report,
 * "tracked" is the total cpu used by the tracked functions only since the last report,
 * "average" is the average (based on "tracked") cpu used per tick 
 */
var ENABLE_PROFILING = true;

Memory.profiling = Memory.profiling || {};

if (ENABLE_PROFILING) 
{
    wrap (RoomPosition.prototype, 'isNearTo');
    wrap (RoomPosition.prototype, 'findPathTo');
    wrap (RoomPosition.prototype, 'isEqualTo');
    wrap (RoomPosition.prototype, 'findClosest');
    
    wrap (Creep.prototype);
    
    wrap (Room.prototype);
    wrap (Room.prototype);
    
    wrap (Spawn.prototype, 'createCreep');
    
    wrap (globals, 'require');
}

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
        
        var innerFunction = object [funcName];
        object [funcName] = function () 
        {
            var usedBefore = Game.getUsedCpu ();
            var returnValue = innerFunction.apply (this, arguments);
            profilingData.usage += Game.getUsedCpu () - usedBefore;
            profilingData.count++;
            return returnValue;
        }
    }
}

function report ()
{
    Memory._lastProfilerReportTime = Memory._lastProfilerReportTime || Game.time;
       
    var summary = 0;
    // total used by tracked functions
    var tracked = 0;
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
        tracked += profilingData.usage;
    }

    for (var functionName in Memory.profiling) 
    {
        profilingData = Memory.profiling [functionName];
        
        console.log (functionName + ': ' + profilingData.usage.toFixed (2) + '/' + profilingData.count + ' == ' + profilingData.average.toFixed (2)
                    + ' (' + (profilingData.average * 100 / summary).toFixed (2) + '%)');
    }
    
    var timeSinceLastReport = Game.time - Memory._lastProfilerReportTime;
     
    console.log ('--- summary: ' + summary.toFixed (2));
    console.log ('--- tracked: ' + tracked.toFixed (2));
    console.log ('--- average: ' + (tracked / timeSinceLastReport).toFixed (2));

    Memory._lastProfilerReportTime = Game.time;
    Memory.profiling = {};
}

module.exports = 
{
	wrap : wrap,
    report : report
}
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

var usedOnStart = 0;
usedOnStart = getUsedCpu ();

Memory.profiling = Memory.profiling || {};
Memory._lastProfilerReportTime = Memory._lastProfilerReportTime || Game.time;

/**
 * Same as Game.getUsedCpu, but works in simulation mode
 */
function getUsedCpu ()
{
    return Game.room.sim ? performance.now () - usedOnStart : Game.getUsedCpu ();
}

/**
 * Wraps the given function to be profiled.
 * Can accept an object containing the function and the function name,
 * an object only (then all of its functions, excluding those starting with "_" will be wrapped,
 * or just a function)
 */
function wrap (object, funcName)
{
    // A function is given, so wrap it
    if (!funcName && object instanceof Function)
    {
        var innerFunction = object;
        var funcName = innerFunction.name;
        if (!funcName)
        {
            var numEntries = 0;
            while (Memory.profiling ["Anonymous function #" + numEntries])
            {
                numEntries++;
            }
            funcName = "Anonymous function #" + numEntries;
        }
        
        var profilingData = Memory.profiling [funcName] = Memory.profiling [funcName] || { usage: 0, count: 0 }
        
        object [funcName] = getWrapper (innerFunction, profilingData);
    }
    
    // An object is given, so wrap all of its 
    // public (not starting with '_') functions
    if (!funcName) 
    {
        var keys = Object.keys (object);
        for (var i in keys) 
        {
            var propName = keys[i];
            // Object prototype doesn't have this property (to exclude toString etc.),doesn't start with '_' and is a function
            if (!Object.prototype.hasOwnProperty (propName) && propName.indexOf ('_') !== 0 && object [propName] instanceof Function) 
            {
                wrap (object, propName);
            }
        }
        return;
    }
    
    if (object [funcName])
    {
        var name = object.name + funcName;
        var profilingData = Memory.profiling [funcName] = Memory.profiling [funcName] || { usage: 0, count: 0 }
        
        var innerFunction = object [funcName];
        object [funcName] = getWrapper (innerFunction, profilingData);
    }
}

/**
 * Returns a wrapper function which represents 'func',
 * and sends profiling data to 'profilingObject'
 */
function getWrapper (func, profilingObject)
{ 
    return function ()
    {
        var usedBefore = getUsedCpu ();
        var returnValue = func.apply (this, arguments);
        
        profilingObject.usage += getUsedCpu () - usedBefore;
        profilingObject.count++;
        
        return returnValue;
    }
}

function logReport ()
{     
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

function getData ()
{
    var data = 
    {
        functions : {},
        cpuUsage :
        {
            summary : 0,
            tracked : 0,
            average : 0
        }
    }
    
    for (var functionName in Memory.profiling)
    {
        var functionData = data.functions [functionName] =
        {
            usage : 0,
            count : 0,
            average : 0,   
        }
        
        var profilingData = Memory.profiling [functionName];
        
        if (profilingData.count === 0) 
        {
            profilingData.average = 0;
            functionData.average = 0;
            continue;
        }
        
        profilingData.average = profilingData.usage / profilingData.count;
        
        functionData.usage = profilingData.usage;
        functionData.average = profilingData.average;
        
        data.cpuUsage.summary += profilingData.average;
        data.cpuUsage.tracked += profilingData.usage;
        
    }
    
    var timeSinceLastReport = Game.time - Memory._lastProfilerReportTime;
    data.cpuUsage.average = data.cpuUsage.tracked / timeSinceLastReport;
   
    // Sort data.functions so that the biggest cpu consumer appears first
    var keysSorted = Object.keys (data.functions).sort ( function (a,b) 
        { 
            return data.functions [a].used - data.functions [b].used; 
        });
        
    var functionsNew = {};
    for (var key in keysSorted)
    {
        functionsNew [key] = data.functions [key];
    }
    
    // Now the entries are sorted by cpu consumption
    data.functions = functionsNew;
    
    Memory._lastProfilerReportTime = Game.time;
    Memory.profiling = {};
    
    return data;
}

module.exports = 
{
	wrap : wrap,
    getData : getData,
    getUsedCpu : getUsedCpu,
    logReport : logReport
}
/**
 * Based on Actium's profiler:
 * http://support.screeps.com/hc/communities/public/questions/201375902-_profiling
 *
 * Output: 
 * "tracked" is the total cpu used by the tracked functions only since the last report,
 * "trackedPerTick" is the average (based on "tracked") cpu used per tick,
 * "total" is the total cpu used since the last report,
 * "totalPerTick" is the average (based on "total") cpu used per tick 
 */

var usedOnStart = 0;
usedOnStart = getUsedCpu ();

/**
 * Same as Game.getUsedCpu, but works in simulation mode
 */
function getUsedCpu ()
{
    return Game.rooms.sim ? performance.now () - usedOnStart : Game.getUsedCpu ();
}

if (!Memory._profiling)
{
    resetMemory ();
}
Memory._lastProfilerReportTime = Memory._lastProfilerReportTime || Game.time;

function resetMemory ()
{
    Memory._profiling =
    { 
        functions : {}, 
        main : 
        { 
            usage : 0, 
            count : 0
        } 
    };
}

/**
 * Returns a wrapper function which represents 'func',
 * and sends profiling data to 'profilingObject'
 */
function getWrapper (func, profilingObject)
{ 
    var innerFunction = func;
    return function ()
    {
        var usedBefore = getUsedCpu ();
        var returnValue = innerFunction.apply (this, arguments);
        
        profilingObject.usage += getUsedCpu () - usedBefore;
        profilingObject.count++;
        
        return returnValue;
    }
}

/**
 * Wraps the function as usual, but treats it as the main
 * function that calls all the others (i.e the one that is executed in main.js)
 */
function wrapAsMainLoop (mainLoopFunction)
{
    return getWrapper (mainLoopFunction, Memory._profiling.main);
}

/**
 * Wraps the given function to be profiled.
 * Can accept an object containing the function and the function name,
 * an object only (then all of its functions, excluding those starting with "_" will be wrapped),
 * or just a function. NOTE: In the last case a wrapped function will be returned, so use it like this:
 * myFunction = profiler.wrap (myFunction);
 */
function wrap (object, funcName)
{
    // A function is given, so wrap it
    if (!funcName && object instanceof Function)
    {
        var func = object;
        var funcName = func.name;
        if (!funcName)
        {
            var numEntries = 0;
            while (Memory._profiling.functions ["Anonymous function #" + numEntries])
            {
                numEntries++;
            }
            funcName = "Anonymous function #" + numEntries;
        }
        
        var profilingData = Memory._profiling.functions [funcName] = Memory._profiling.functions [funcName] || { usage: 0, count: 0 }
        
        return getWrapper (func, profilingData);;
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
        var profilingData = Memory._profiling.functions [funcName] = Memory._profiling.functions [funcName] || { usage: 0, count: 0 }

        object [funcName] = getWrapper (object [funcName], profilingData);
    }
}

function report ()
{
    var timeSinceLastReport = Game.time - Memory._lastProfilerReportTime;
    
    var data = 
    {
        functions : {},
        cpuUsage :
        {
            tracked : 0,
            total : 0,
            trackedPerTick : 0,
            totalPerTick : 0
        }
    }
    
    for (var functionName in Memory._profiling.functions)
    {
        var functionData = data.functions [functionName] =
        {
            usage : 0,
            count : 0,
            perCall : 0,   
            perTick : 0,
            callsPerTick : 0
        }
        
        var profilingData = Memory._profiling.functions [functionName];
        
        if (profilingData.count === 0) 
        {
            profilingData.average = 0;
            continue;
        }
        
        profilingData.average = profilingData.usage / profilingData.count;
        
        functionData.usage = profilingData.usage;
        functionData.count = profilingData.count;
        functionData.perCall = profilingData.average;
        
        if (timeSinceLastReport > 0)
        {
            functionData.perTick = profilingData.usage / timeSinceLastReport;
            functionData.callsPerTick = profilingData.count / timeSinceLastReport;
        }
        
        data.cpuUsage.tracked += profilingData.usage;
    }
    
    data.cpuUsage.total = Memory._profiling.main.usage;
    if (timeSinceLastReport > 0)
    {
        data.cpuUsage.trackedPerTick = data.cpuUsage.tracked / timeSinceLastReport;
        data.cpuUsage.totalPerTick = data.cpuUsage.total / timeSinceLastReport;
    }
   
    // Sort data.functions so that the biggest cpu consumer appears first
    var keysSorted = Object.keys (data.functions).sort ( function (a,b) 
    { 
        return data.functions [b].usage - data.functions [a].usage; 
    });
    var functionsNew = {};
    for (var i in keysSorted)
    {
        functionsNew [keysSorted [i]] = data.functions [keysSorted [i]];
    }
    // Now the entries are sorted by cpu consumption
    data.functions = functionsNew;
    
    Memory._lastProfilerReportTime = Game.time;
    
    resetMemory ();
    
    return data;
}

function logReport (report)
{     
    console.log ('=======REPORT=======');
    
    for (var key in report.functions)
    {
        var functionData = report.functions [key];
        
        console.log (key + ':');
        console.log ('       usage: ' + functionData.usage.toFixed (2));
        console.log ('       count: ' + functionData.count.toFixed (2));
        console.log ('     perCall: ' + functionData.perCall.toFixed (2));
        console.log ('     perTick: ' + functionData.perTick.toFixed (2));
        console.log ('callsPerTick: ' + functionData.callsPerTick.toFixed (2));
        
    }
    
    console.log ('-------');
    console.log ('       tracked: ' + report.cpuUsage.tracked.toFixed (2));
    console.log ('trackedPerTick: ' + report.cpuUsage.trackedPerTick.toFixed (2));
    console.log ('         total: ' + report.cpuUsage.total.toFixed (2));
    console.log ('  totalPerTick: ' + report.cpuUsage.totalPerTick.toFixed (2));
    
    console.log ('=======REPORT=======');
}

module.exports =
{
	wrap : wrap,
    wrapAsMainLoop : wrapAsMainLoop,
    report : report,
    getUsedCpu : getUsedCpu,
    logReport : logReport
}
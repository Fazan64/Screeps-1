/**
 * Based on Actium's profiler:
 * http://support.screeps.com/hc/communities/public/questions/201375902-Profiling
 *
 * Output: 
 * "summary" is a sum of "average per use" values of all tracked functions since the last report,
 * "tracked" is the total cpu used by the tracked functions only since the last report,
 * "average" is the average (based on "tracked") cpu used per tick 
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

Memory.profiling = Memory.profiling || {};
Memory._lastProfilerReportTime = Memory._lastProfilerReportTime || Game.time;

/**
 * Wraps the given function to be profiled.
 * Can accept an object containing the function and the function name, or
 * an object only (then all of its functions, excluding those starting with "_" will be wrapped)
 */
function wrap (object, funcName)
{
    /*
    // A function is given, so wrap it
    if (!funcName && object instanceof Function)
    {
        var func = object;
        var funcName = func.name;
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
        
        func = getWrapper (func, profilingData);
        return;
    }
    */
    
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
        
        object [funcName] = getWrapper (object [funcName], profilingData);
    }
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

function report ()
{
    var timeSinceLastReport = Game.time - Memory._lastProfilerReportTime;
    
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
            perUse : 0,   
            perTick : 0
        }
        
        var profilingData = Memory.profiling [functionName];
        
        if (profilingData.count === 0) 
        {
            profilingData.average = 0;
            functionData.perUse = 0;
            continue;
        }
        
        profilingData.average = profilingData.usage / profilingData.count;
        
        functionData.usage = profilingData.usage;
        functionData.count = profilingData.count;
        functionData.perUse = profilingData.average;
        functionData.perTick = profilingData.usage / timeSinceLastReport;
        
        data.cpuUsage.summary += profilingData.average;
        data.cpuUsage.tracked += profilingData.usage;
    }
    
    data.cpuUsage.average = data.cpuUsage.tracked / timeSinceLastReport;
   
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
    Memory.profiling = {};
    
    return data;
}

function logReport (report)
{     
    console.log ('=======REPORT=======');
    
    for (var key in report.functions)
    {
        var functionData = report.functions [key];
        
        console.log (key + ':');
        console.log ('      usage: ' + functionData.usage);
        console.log ('      count: ' + functionData.count);
        console.log ('     perUse: ' + functionData.perUse);
        console.log ('    perTick: ' + functionData.perTick);
    }
    
    console.log ('-------');
    console.log ('summary: ' + report.cpuUsage.summary);
    console.log ('tracked: ' + report.cpuUsage.tracked);
    console.log ('average: ' + report.cpuUsage.average);
    
    console.log ('=======REPORT=======');
}

module.exports = 
{
	wrap : wrap,
    report : report,
    getUsedCpu : getUsedCpu,
    logReport : logReport
}
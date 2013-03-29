document.addEventListener("DOMContentLoaded", init, false); 

var AUDIO_FILE = 'audio/walking';
var dancer;

Dancer.setOptions({
    flashSWF : 'lib/soundmanager2.swf',
    flashJS  : 'lib/soundmanager2.js'
});

dancer = new Dancer();

dancer.load({ src: AUDIO_FILE, codecs: [ 'ogg', 'mp3' ]});

Dancer.isSupported() || loaded();
!dancer.isLoaded()? dancer.bind( 'loaded', loaded ) : loaded();

function loaded()
{
    dancer.play();
}

var colIndex = -1;

var ccols = ["red", "green", "blue", "orange", "black", "purple",
             "silver", "yellow", "teal", "maroon"];    

var queCols = ["red", "black", "orange"];

var curCols = queCols.slice(0);

var activeBoxes = [0];

var counter = 0;
var changeCounter = 0;

var dis = 100;

var ang = 0.0;
var delta = 0.01;

var timeMin = 240;
var timeMax = 1000;

var rotTime = Math.floor((timeMax - timeMin)*Math.random()) + timeMin;
var cChangeThresh = 165;

var sigArray = dancer.getSpectrum();
var lastSigs = new Float32Array(sigArray.length);
var sum;
var lastSum;
var mult = 40;
var scale = 2.0;

function init()
{
    setInterval(player, 16);
}

function player()
{
    var canvas = document.getElementById("canvas");   
    var ctx = canvas.getContext("2d");    
    sum = 0.0;
    sigArray = dancer.getSpectrum();
    for(i = 0; i < sigArray.length; i++){
    //have to fool around with mult and scale here
    //10 and 1.5 work pretty well
        sum += sigArray[i]*1000*mult/Math.pow((i+10), scale);
    }
    if(sum < lastSum){
        sum = lastSum - 5;
    }
    if(sum > lastSum + cChangeThresh){
        queCols = pickFromList(ccols, 3);
    }
    dis = sum;
    draw();
    lastSum = sum;
    //clear the old FFT data
    ctx.fillStyle = "black";
    for(i = 0; i < lastSigs.length; i++){
        ctx.fillRect(2*i, 0, 2, 1000*lastSigs[i]);
    }
    ctx.fillStyle = "red";
    for(i = 0; i < sigArray.length; i++){
        ctx.fillRect(2*i, 0, 2, 1000*sigArray[i]);
        lastSigs[i] = sigArray[i];
    }
}

function draw()
{
    var canvas = document.getElementById("canvas");   
    var ctx = canvas.getContext("2d");
    var x = dis*Math.cos(ang);
    var y = dis*Math.sin(ang);
    
    var absx = Math.abs(x);
    var absy = Math.abs(y);
    
    var shapeFuncs = function(col){
              return [function(){
            sqrs(350, 350, ctx, dis, col, ang);
        }, 
                function(){
            circs(350, 350, ctx, dis, col);
        },
                function(){
            tris(350, 350, ctx, dis, col, ang);
        },
                function(){
            kCurve(350, 350, x + 350, (-1*y) + 350, ctx, col, 5);
        },
                function(){
            snows(ctx, dis, col, ang);
        },
                function(){
            stars(350, 350, ctx, dis, col, ang);
        }
        ]
    }

    function shapeCallback(col, i)
    {
        return shapeFuncs(col)[i];
    }
    
    var timeStep = Math.floor(curMilliDiff);
    
    for(var i in queCols)
    {
        for(var j in activeBoxes)
        {
            setTimeout(shapeCallback(queCols[i], 
            activeBoxes[j]), timeStep*i);
        }
    }

    ang += delta;
    counter += 1;

    if(counter >= rotTime){
        counter = 0;
        rotTime = Math.floor(760*Math.random()) + 240;
        delta *= Math.random()/2.5 - 1.40;
        changeCounter += 1;
    }

    if(changeCounter >= 3){
        activeBoxes[0] = genIndex(6);
        changeCounter = 0;
    }

}

//sometimes we want to pick, say, 3 new colors from the color list
//this should be good for small lists
function pickFromList(origList, n)
{
    //clone the array
    var lst = origList.slice(0);
    var r = new Array();
    var totLen = lst.length;
    var curLen = totLen;

    if(n >= totLen){
        return lst;
    }

    var i, j, p;

    //picks an element, then shifts everything left and narrows the range
    for(i = 0; i < n; i++){
        p = genIndex(curLen);
        r[i] = lst[p];
        for(j = p + 1; j < totLen; j++){
            lst[j-1] = lst[j];
        }
        curLen--;
    }

    return r;

}

function genIndex(n)
{
    return Math.floor(n*Math.random());
}

function circs(x, y, ctx, sze, col)
{
    if (sze < 20) 
        return;
    var nsze = Math.floor(sze);
    ctx.beginPath();
    ctx.moveTo(x+nsze, y);
    ctx.arc(x, y, nsze, 0, 2*Math.PI);
    ctx.strokeStyle = col;
    ctx.stroke();
    circs(x+nsze, y, ctx, nsze/2);
    circs(x-nsze, y, ctx, nsze/2);
    circs(x, y+nsze, ctx, nsze/2);
    circs(x, y-nsze, ctx, nsze/2);
}

function myMod(x, n)
{
    var nx = x;
    while(nx < 0)
        nx = nx + n;
    while(nx >= n)
        nx = nx - n;
    return nx;
}

function sqrs(x, y, ctx, dis, col, rot)
{
    if (dis < 5)
        return;
   
    var rads = myMod(rot, Math.PI/2);
    var cx = new Array();
    var cy = new Array();
    for (var i = 0; i < 4; i++){
        cx[i] = x + dis*Math.cos(rads+(i*Math.PI/2));
        cy[i] = y - dis*Math.sin(rads+(i*Math.PI/2));
    }
    if (col == "white")
        ctx.lineWidth = 3;
    else ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx[3], cy[3]);
    for (var i = 0; i < 4; i++)
        ctx.lineTo(cx[i], cy[i]);
    ctx.strokeStyle = col;
    ctx.stroke();
    
    for (var i = 0; i < 4; i++)
        sqrs(cx[i], cy[i], ctx, dis/3, col, rot+Math.PI/4);
    
}

function tris(x, y, ctx, dist, col, rot)
{   
    var rads = rot + Math.PI/4;
    var dis = Math.sqrt(2)*dist;
    
    var d1x = dis*Math.cos(rads);
    var d1y = dis*Math.sin(rads);
    var d2x = dis*Math.cos(rads-Math.PI/2);
    var d2y = dis*Math.sin(rads-Math.PI/2);

    if(dis < 20)
    {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x+d1x, y-d1y);
        ctx.lineTo(x+d2x, y-d2y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = col;
        ctx.stroke();
        return;
    }
    
    tris(x, y, ctx, dist/2, col, rot);
    tris(x + d1x/2, y - d1y/2, ctx, dist/2, col, rot);
    tris(x + d2x/2, y - d2y/2, ctx, dist/2, col, rot);
}

function snows(ctx, dist, col, rot)
{
    
    var p1x = 350 + dist*Math.cos(rot);
    var p1y = 350 - dist*Math.sin(rot);
    var p2x = 350 + dist*Math.cos(rot + 2*Math.PI/3);
    var p2y = 350 - dist*Math.sin(rot + 2*Math.PI/3);
    var p3x = 350 + dist*Math.cos(rot + 4*Math.PI/3);
    var p3y = 350 - dist*Math.sin(rot + 4*Math.PI/3);
    
    kCurve(p1x, p1y, p2x, p2y, ctx, col, 25);
    kCurve(p2x, p2y, p3x, p3y, ctx, col, 25);
    kCurve(p3x, p3y, p1x, p1y, ctx, col, 25);
    
}

function kCurve(x1, y1u, x2, y2u, ctx, col, lim)
{  
    
    var y1 = 700 - y1u;
    var y2 = 700 - y2u;
    
    var p1x = (2/3)*x1 + (1/3)*x2;
    var p1y = (2/3)*y1 + (1/3)*y2;
    var p2x = (1/3)*x1 + (2/3)*x2;
    var p2y = (1/3)*y1 + (2/3)*y2;
    
    var dist = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
    
    if(x1 == x2)
    {
        if(y2 < y1)
            var theta = -Math.PI/2;
        else var theta = Math.PI/2;
    }
    else var theta = Math.atan((y2-y1)/(x2-x1));
    
    if(x2-x1 < 0)
        theta += Math.PI;
    /*
    if(x2 > x1)
        var ntheta = theta - Math.PI/6;
    else var ntheta = theta + Math.PI/6;
    */
    
    var ntheta = theta - Math.PI/6;
    
    var ndist = Math.sqrt(3)*dist/3;
    
    var p3x = x1 + ndist*Math.cos(ntheta);
    var p3y = y1 + ndist*Math.sin(ntheta);
    
    if(dist < lim)
    {
        ctx.beginPath();
        ctx.moveTo(x1, 700 - y1);
        ctx.lineTo(p1x, 700 - p1y);
        ctx.lineTo(p3x, 700 - p3y);
        ctx.lineTo(p2x, 700 - p2y);
        ctx.lineTo(x2, 700 - y2);
        
        ctx.strokeStyle = col;
        ctx.stroke();
    }
    else
    {
        kCurve(x1, 700 - y1, p1x, 700 - p1y, ctx, col, lim);
        kCurve(p1x, 700 - p1y, p3x, 700 - p3y, ctx, col, lim);
        kCurve(p3x, 700 - p3y, p2x, 700 - p2y, ctx, col, lim);
        kCurve(p2x, 700 - p2y, x2, 700 - y2, ctx, col, lim);
    }

}

function stars(x, y, ctx, dis, col, rot)
{
    var px = new Array();
    var py = new Array();
    for(var i = 0; i < 5; i++)
    {
        px[i] = x + dis*Math.cos(rot + 2*i*Math.PI/5);
        py[i] = y - dis*Math.sin(rot + 2*i*Math.PI/5);
    }
    
    ctx.beginPath();
    ctx.moveTo(px[0], py[0]);
    ctx.lineTo(px[2], py[2]);
    ctx.lineTo(px[4], py[4]);
    ctx.lineTo(px[1], py[1]);
    ctx.lineTo(px[3], py[3]);
    ctx.lineTo(px[0], py[0]);
    
    ctx.strokeStyle = col;
    ctx.stroke();
    
    if(dis > 20)
        stars(x, y, ctx, Math.cos(72*Math.PI/180)*dis/Math.cos(36*Math.PI/180), 
        col, rot + Math.PI/5);
    
}

function clearScn()
{
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
   
    ctx.save();
    ctx.setTransform(1, 0 , 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
}

var curTempo = 138;
var curMilliDiff = 120000/curTempo;
var lastTime = 0;

function updateTempo()
{
    var d = new Date();
    var tm = d.getTime();
    if(lastTime == 0)
    {
        lastTime = tm;
        return;
    }
    var deltaT = tm - lastTime;
    var bpm = 60000/deltaT;
    curTempo = (curTempo + bpm)/2;
    curMilliDiff = 120000/curTempo
    lastTime = tm;
    document.getElementById("tempoLabel").value = curTempo.toFixed(1);
}

function newTempo(val)
{
    var newTmp = parseFloat(val);
    if(newTmp > 10 && newTmp < 500)
    {
        curTempo = newTmp;
        curMilliDiff = 120000/curTempo;
        lastTime = 0;
    }
}




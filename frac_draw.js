document.addEventListener("DOMContentLoaded", init, false);
document.addEventListener("mousemove", checkBorder, false);
document.addEventListener("mouseup", mUp, false); 

var mouseDown = 0;

var colIndex = -1;

//keep an even number of colors please!
var ccols = ["red", "green", "blue", "orange", "black", "purple",
             "silver", "yellow", "teal", "maroon"];    

var queCols = ["black", "orange", "red"];
var curCols = queCols.slice(0);

var quePreview = -1;

var queHover = -1;

var sqrBox = new Image();
sqrBox.src = "nimg/sqr_sprite_solo.png"; 

var circBox = new Image();
circBox.src = "nimg/circ_sprite_solo.png";

var triBox = new Image();
triBox.src = "nimg/tri_sprite_solo.png";

var activeBoxes = [2];

function init()
{
    var canvas = document.getElementById("canvas");
    canvas.addEventListener("mousemove", draw, false);
    canvas.addEventListener("mousedown", function(){mouseDown=1;}, false);
    
    var colSel = document.getElementById("colSelect");
    var selCtx = colSel.getContext("2d");   
    
    sqrBox.onload = function(){
        selCtx.drawImage(sqrBox, 5, 545);
    };
    
    circBox.onload = function(){
        selCtx.drawImage(circBox, 85, 545);
    };
    
    triBox.onload = function(){
        selCtx.drawImage(triBox, 165, 545);
    };
    
    drawColBoxes(colSel, selCtx, -1);      
    
    colSel.addEventListener("mousedown", colSelected, false);
    colSel.addEventListener("mousemove", moveSelected, false);
    
}

function mUp()
{
    mouseDown = 0;
    if(quePreview >= 0)
    {
        queCols = curCols.slice(0);
        quePreview = -1;
    }
    colIndex = -1;
    var canv = document.getElementById("colSelect");
    drawColBoxes(canv, canv.getContext("2d"), -1);        
}

function drawColBoxes(canv, ctx, noDraw)
{
    
    ctx.clearRect(0, 0, canv.width, canv.height);  
    
    if(quePreview >= 0)
        var colQueue = curCols;
    else var colQueue = queCols;
    
    for(var i in colQueue)
    {
        if(colQueue[i] == "white")
            continue;
        if(i == quePreview)
            ctx.globalAlpha = 0.25;
        ctx.fillStyle = colQueue[i];
        ctx.fillRect(0, 55*i, 50, 50);
        ctx.globalAlpha = 1.0;
    }
    
    var th, tw;
    
    for(var i in ccols){
        if(i == noDraw)
            continue;
        th = (Math.floor(i/2)) * 50;
        tw = (i % 2) * 50;
        ctx.fillStyle = ccols[i];
        ctx.fillRect((11*tw/10) + 95, (11*th/10) + 200, 50, 50);
    }
    
    ctx.fillStyle = "lime";
    var bIndex;
    ctx.globalAlpha = 0.85;
    for(var i in activeBoxes)
    {
        bIndex = activeBoxes[i];
        ctx.fillRect(5 + 80*(bIndex % 3), 545 + 80*(Math.floor(bIndex/3)), 
                    75, 75);
    }
    ctx.globalAlpha = 1.0;
    ctx.drawImage(sqrBox, 5, 545);
    ctx.drawImage(circBox, 85, 545);
    ctx.drawImage(triBox, 165, 545);
       
}

function inColGap(x, y)
{
    if(x <= 95 || x >= 200 || y <= 200) // on the left, right or top
        return true;
    if(x >= 145 && x <= 150) // in the middle gap
        return true;
    if(y >= 200 + 55*(ccols.length/2)) // off the bottom
        return true;
    var checkY = y;
    while(checkY >= 255)
        checkY -= 55;
    if(checkY >= 250) // in a row gap
        return true;
    return false;
}

function inFracGap(x, y)
{
    if(x <= 5 || x >= 240 || y <= 545 || y >= 700)
        return true;
    if(y <= 545+80 && y >= 545+75) // middle row gap
        return true;
    if(x >= 80 && x <= 85) // 1st col gap
        return true;
    if(x >= 160 && x <= 165) // 2nd col gap
        return true;
    return false;
}

function colSelected(e)
{
    
    mouseDown = 2;
    colIndex = -1;
    
    var canvas = document.getElementById("colSelect");
    var ctx = canvas.getContext("2d");
    var x = e.x - canvas.offsetLeft;
    var y = e.y - canvas.offsetTop;
 
    if(queHover >= 0)
    {
        queCols.splice(queHover, 1);
        curCols = queCols.slice(0);
    }
 
    if(inColGap(x, y))
    {
        if(inFracGap(x, y))
            return;
        var rownum;
        if(y <= 545 + 75 + 2)
            rownum = 0;
        else rownum = 1;
        var colnum;
        colnum = Math.floor(x/80);
        var newSel = 3*rownum + colnum;
        activeBoxes = [newSel];
        return;
    }
    
    var colnum;
    if(x <= 95 + 50 + 2)
        colnum = 0;
    else colnum = 1;
    var rownum;
    rownum = Math.floor((y - 200)/55);
    
    colIndex = 2*rownum + colnum;
    
    
    /* Animation -- not really working
    while(boxX != desX || boxY != desY)
    {
        drawColBoxes(canvas, ctx, colIndex);
        ctx.fillStyle = ccols[colIndex];
        ctx.fillRect(boxX, boxY, 50, 50);
        if(boxX < desX)
            boxX++;
        else if(boxX > dexX)
            boxX--;
        if(boxY < desY)
            boxY++;
        else if(boxY > desY)
            boxY--;
    }
    */
    
}

function moveSelected(e)
{

    var canvas = document.getElementById("colSelect");
    var ctx = canvas.getContext("2d");      

    var x = e.x - canvas.offsetLeft;
    var y = e.y - canvas.offsetTop;         
    if(mouseDown != 2)
    {
        if(x < 50 && y < 55*queCols.length)
        {           
            if(queHover >= 0)
                drawColBoxes(canvas, ctx, colIndex);
            var checkY = y;
            while(checkY > 55)
                checkY -= 55;
            if(checkY >= 50)
                return;
            queHover = Math.floor(y/55);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(3, 55*queHover + 3);
            ctx.lineTo(47, 55*queHover + 47);
            ctx.moveTo(47, 55*queHover + 3);
            ctx.lineTo(3, 55*queHover + 47); 
            ctx.stroke();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(4, 55*queHover + 4);
            ctx.lineTo(46, 55*queHover + 46);
            ctx.moveTo(46, 55*queHover + 4);
            ctx.lineTo(4, 55*queHover + 46); 
            ctx.stroke();              
        }
        else if(queHover >= 0)
        {
            queHover = -1;
            drawColBoxes(canvas, ctx, colIndex);
        }
        return;
    }
    
        
    if(colIndex < 0)
        return; 

    drawColBoxes(canvas, ctx, colIndex);
    ctx.fillStyle = ccols[colIndex];
    ctx.fillRect(x - 25, y - 25, 50, 50); 

    if(x < 75)
    {
        var quePos = Math.floor(y/55);
        if(quePos > curCols.length)
            quePos = curCols.length;
        if(quePos < 0)
            quePos = 0;                
        if(quePos != quePreview)
        {
            if(quePreview >= 0)
                curCols.splice(quePreview, 1);
            
            curCols.splice(quePos, 0, ccols[colIndex]);
            quePreview = quePos;
            if(quePreview >= curCols.length)
                quePreview = curCols.length - 1;
        }
    }
    else
    {
        quePreview = -1;
        curCols = queCols.slice(0);
    }
}

function checkBorder(e)
{
    if(e.x < 700 && queHover >= 0)
    {
        queHover = -1;
        var clrCan = document.getElementById("colSelect");
        drawColBoxes(clrCan, clrCan.getContext("2d"), -1);
    }
    if (mouseDown == 0) 
        return;
    if (mouseDown == 1)
        var canvas = document.getElementById("canvas");
    else if (mouseDown == 2)
        var canvas = document.getElementById("colSelect");
    else return;
    
    var x = e.x - canvas.offsetLeft;
    var y = e.y - canvas.offsetTop;
    if (x >= canvas.width || y >= canvas.height || x <= 0 || y <= 0)
    {
        if(mouseDown == 2)
        {
            drawColBoxes(canvas, canvas.getContext("2d"), -1);
            colIndex = -1;
        }
        mouseDown = 0;
    }    
}

function draw(e)
{

    if (mouseDown != 1)
        return;
        
    var canvas = document.getElementById("canvas");   
    var ctx = canvas.getContext("2d");
    var x = e.x - this.offsetLeft - 350;
    var y = 350 - e.y - this.offsetTop;
    
    var absx = Math.abs(x);
    var absy = Math.abs(y);
    var dis = Math.sqrt(Math.pow(absx,2)+Math.pow(absy,2));
    
    var ang;
    if(x == 0)
    {
        if(y >= 0)
            ang = Math.PI/2;
        else ang = -1*Math.PI/2;
    }
    else ang = Math.atan(y/x);
    if(x < 0)
        ang += Math.PI;

    var shapeFuncs = function(col){
              return [function(){
            sqrs(350, 350, ctx, dis, col, ang);
        }, 
                function(){
            circs(350, 350, ctx, dis, col);
        },
                function(){
            tris(350, 350, ctx, dis, col, ang);
        }
        ]
    }

    function shapeCallback(col, i)
    {
        return shapeFuncs(col)[i];
    }
    
    var timeStep = curMilliDiff;
 
    for(var i in queCols)
    {
        for(var j in activeBoxes)
        {
            setTimeout(shapeCallback(queCols[i], 
            activeBoxes[j]), timeStep*i);
        }
    }
    

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
    if(dist < 20) 
        return;
    
    var rads = rot + Math.PI/4;
    var dis = Math.sqrt(2)*dist;
    
    document.getElementById("bottomText").innerHTML = rot.toFixed(3);
    
    var d1x = dis*Math.cos(rads);
    var d1y = dis*Math.sin(rads);
    var d2x = dis*Math.cos(rads-Math.PI/2);
    var d2y = dis*Math.sin(rads-Math.PI/2);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+d1x, y-d1y);
    ctx.lineTo(x+d2x, y-d2y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = col;
    ctx.stroke();
    
    tris(x, y, ctx, dist/2, col, rot);
    tris(x + d1x/2, y - d1y/2, ctx, dist/2, col, rot);
    tris(x + d2x/2, y - d2y/2, ctx, dist/2, col, rot);
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

var curTempo = 120;
var curMilliDiff = 1000;
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
/*
Author: Jordan A. Awan
Project: CapBuilder
File: drawingStuff.js
Purpose (of project: to provide the user a way to construct caps in AG(n,3) for n=2,...,7
	-the program determines which points cannot be added to the cap
	-the program determines the order of each point that cannot be added to the cap
		(the number of lines in the set if the point were added to the cap)
	-the program determines the order signature of the cap
		(the tally of each of the orders)
	-the program determines the parallel signature
		(if we make equivalence classes of the 2-lines in the cap calling two 2-lines 
		equivalent if they are parallel, then the parallel signature tallies the sizes of 
		these equivalence classes)

Purpose (of file): to provide the necessary methods for the program to run
	-methods to draw all necessary shapes and symbols
	-methods to convert between data types
	-methods to determine which points cannot be added to the cap as well as their orders
	-methods to determine the order and parallel signatures
	-methods to remove points from the cap and to clear the cap
-methods to create a random cap
*/


function clear_click()//resets all variables and redraws canvas
{
	ctx.clearRect ( 0 , 0 , canvas.width , canvas.height );
	
	var len=document.DEForm.dimension.length;
	//alert(len);
	for(var i=0;i<len;i++)
		if(document.DEForm.dimension[i].checked)
		{
			DIM=document.DEForm.dimension[i].value;
			break;
		}
	NUMPOINTS = Math.pow(3,DIM);
	width=Math.pow(3,~~(DIM/2)+DIM%2);//measured in entries
	height=Math.pow(3,~~(DIM/2));
	var Narray=[0,200,144,120,48,40,16,14];
	N=Narray[DIM];
	var Marray=[0,1,2,4,10,22,56,180];
	MAXORDER=Marray[DIM];
	X0=~~((PANWID-N*width)/2);
	Y0=~~((PANHEI-N*height)/2);

	countpts=0;
	occList= [];//treated like 
	occBool= [];//bool array
	elimBool=[];//bool array
	numelim=[];//int array
	parsig=[];//int array
	for(var i=0;i<NUMPOINTS;i++)
	{
	occBool[i]=false;
	elimBool[i]=false;
	numelim[i]=0;
	parsig[i]=0;
	}
	drawGrid();
	document.getElementById('points').innerHTML="<center>Pts</center>";
	document.getElementById('signature').innerHTML="<center>OSig</center>";//OrderSignature
	document.getElementById('parsig').innerHTML="<center>PSig</center>";//ParallelSignature
	document.getElementById('numpoints').innerHTML="Cap Size: ";
	document.getElementById('complete').innerHTML="";
}

//determines which points are in line with the point num and any other point in the cap.
function calcPointsElim(num,draw)
{
var a,c;
var plotc;

for(var i=0;i<countpts;i++)
{
a=occList[i];
c = completeLine(num, a);
plotc = numToPoint(c);
					elimBool[c] = true;
					numelim[c]++;
                if (draw)
                {				
                    if (document.DEForm.elimType[0].checked)
					{
                        drawClear(plotc.x,plotc.y);
						drawElim(plotc.x,plotc.y);
					}
                    else if (document.DEForm.elimType[1].checked)
					{
                        drawCross(plotc.x,plotc.y);
					}	
                }
}

occBool[num]=true;
occList[countpts]=num;
countpts++;


}

function calcPointsUndo(num,draw)
{
occBool[num] = false;
var index=occList.indexOf(num);
occList.splice(index,1);

countpts--;
var a,c;
var plotc;
	for(var i =0;i<countpts;i++)
	{
	a=occList[i];
	c=completeLine(a,num)
	numelim[c]--;
	plotc=numToPoint(c);
	if(numelim[c]==0)
	{
	elimBool[c]=false;
	drawClear(plotc.x,plotc.y);
	}
	else
	{
		if(document.DEForm.elimType[0].checked)//Numbers selected
		{
			drawClear(plotc.x,plotc.y);
			drawElim(plotc.x,plotc.y);
		}
	}
}

}
//is it either in the cap or eliminated
function isTaken(num)
{
return (occBool[num]||elimBool[num]);
}

function completeLine(a,b)
{
			var answer = 0;
            var pow3;
            for(var i=0;i<DIM;i++)
            {
                pow3=Math.pow(3,i);
                answer += ((6-~~(a / pow3) % 3 - ~~(b / pow3) % 3)%3)*pow3;
            }
            return answer;

}

function isCompleteCap()
{
	for(var i=0;i<NUMPOINTS;i++)
	{
		if(!isTaken(i))
			return false;
	}
	return true;

}

function detSignature()
{
var sig=new Array();
for(var i=0;i<=MAXORDER;i++)sig[i]=0;//initialize array;

for(var i=0;i<=MAXORDER;i++)
	for(var j=0;j<NUMPOINTS;j++)
		if(numelim[j]==i)
			sig[i]++;
return sig;
}

function updateParSig(p,forward)//this is the parallel directions, not the tally
{
var fresult=0,sresult=0,result;
var pow3;
var q;
for(var num=0;num<countpts;num++)
{
	fresult=sresult=0;
	q=occList[num];
	if(q!=p)
	{
		for(var i=0;i<DIM;i++)
		{
			pow3=Math.pow(3,i);
			fresult+=((  9+ (~~(p/pow3))%3-(~~(q/pow3))%3  )%3)*pow3;
			sresult+=((  9-(~~(p/pow3))%3+(~~(q/pow3))%3  )%3)*pow3;
		}
		result=Math.min(sresult,fresult);
		//alert(result);
			if (forward)
				parsig[result]++;
			else
				parsig[result]--;
	}
}
}

function detParSig()//generates the parallel signature. does not display.
{
var numparsig=new Array();
for(var i=0;i<NUMPOINTS;i++)
	numparsig[i]=0;
for(var i=0;i<NUMPOINTS;i++)
	numparsig[parsig[i]]++;

return numparsig;
}

function radElim_click()
{
var entry;var num;
var radNum=document.getElementById('number');
var radCross=document.getElementById('cross');
for(var num=0;num<NUMPOINTS;num++)
{
	if(elimBool[num])
	{
	entry=numToPoint(num);
	drawClear(entry.x,entry.y);
	if(radNum.checked)
	{
		drawElim(entry.x,entry.y);
	}
	else if(radCross.checked)
	{
		drawCross(entry.x,entry.y);
	}
	}
}
}

function randomCap()
{
clear_click();
var num;
var entry;
while(!isCompleteCap())
{
	num=~~(Math.random()*NUMPOINTS);
	if(!isTaken(num))
	{
		entry=numToPoint(num);
		drawDot(entry.x,entry.y);
		calcPointsElim(num,false);
		updateParSig(num,true);
	}
}
for(num=0;num<NUMPOINTS;num++)
{
	if(elimBool[num])
	{
		entry=numToPoint(num);
		if(document.getElementById('number').checked)
			drawElim(entry.x,entry.y);
		else if(document.getElementById('cross').checked)
			drawCross(entry.x,entry.y);
	}
}

occList.sort(function(a,b){return a-b});
outputMeasures();

}

function outputMeasures()
{
		
		var pHTML=document.getElementById('points');
		pHTML.innerHTML="<center>Pts</center>";
		
		for(var i=0;i<occList.length;i++)
			pHTML.innerHTML+='<br>'+occList[i];
                
		var sig=detSignature();
		
		var sHTML=document.getElementById('signature');
		sHTML.innerHTML="<center>OSig</center>";
		for(var i=0;i<=MAXORDER;i++)
			if(sig[i]!=0)
				sHTML.innerHTML+='<br>'+i+': '+sig[i];
				
		var numparsig=detParSig();
		
		psHTML=document.getElementById('parsig');
		psHTML.innerHTML="<center>PSig</center>";
		
		for(var i=1;i<NUMPOINTS;i++)
			if(numparsig[i]!=0)
				psHTML.innerHTML+="<br>" +i+": "+numparsig[i];

                if (isCompleteCap())
                {
					document.getElementById('complete').innerHTML="<center><h2>COMPLETE</h2></center>";
                }
				else
				{
					document.getElementById('complete').innerHTML="";
				}
				document.getElementById('numpoints').innerHTML="Cap Size: "+ countpts;
}
//does not work.
/*function readFile (evt) {
   //alert("hello");
   var files = evt.target.files;
   var file = files[0];           
   var reader = new FileReader();
   reader.onload = function(evt) {
	 //console.log(this.result);            
   }
   reader.readAsText(file);
	alert(evt.target.result);
   //alert("hello");
}
*/


//#region//conversions
//{
function getMousePos(evt)
{
var rect=canvas.getBoundingClientRect();
return{
x: evt.clientX-rect.left,
y: evt.clientY-rect.top
};
}

function selectedEntry(p0)
{
return{
	x: ~~((p0.x-X0-(p0.x-X0)%N)/N),
	y:	~~((p0.y-Y0-(p0.y-Y0)%N)/N)
};
}

function pointToNum(x,y)
{
var x0, x9, x81, x729, y3, y27, y243;
            if (x >= 0 && y >= 0 && x<width &&y < height)
            {


                x0 = x % 3;
                x9 = ~~((x % 9 - x% 3) / 3);
                x81 = ~~((x % 27 - x % 9) / 9);
                x729 = ~~((x % 81 - x % 27) / 27);//new
                y3 = y % 3;
                y27 = ~~((y % 9 - y % 3) / 3);//added mod 27
                y243 = ~~((y % 27 - y % 9) / 9);

                return x0 + 3 * y3 + 9 * x9 + 27 * y27 + 81 * x81 + 243 * y243 + 729 * x729;
            }
            return -1;
}

function numToPoint(num)
{
//Point p = new Point(0, 0);
            var x1, x2, x3, x4, y1, y2, y3;
            x1 = num % 3;
            y1 = ~~((num % 9 - num % 3) / 3);
            x2 = ~~((num % 27 - num % 9) / 9);
            y2 = ~~((num % 81 - num % 27) / 27);
            x3 = ~~((num % 243 - num % 81) / 81);//was mod 9
            y3 = ~~((num % 729- num % 243) / 243);//new
            x4 = ~~((num - num % 729) / 729);

			return{
            x: (x1 + 3*x2 + 9*x3 + 27*x4),
            y: (y1 + 3*y2 + 9*y3)
			};


}
//}

//#region drawing stuff
//{


function drawGrid()
{

ctx.strokeStyle="#CCCCCC";
ctx.lineWidth=1;
//vertical lines
for(var w=0;w<=width;w++)
{
	ctx.beginPath();
	ctx.moveTo(X0+w*N,Y0);
	ctx.lineTo(X0+w*N,Y0+N*height);
	ctx.stroke();
}
//horizontal lines
for(var h=0;h<=height;h++)
{
	ctx.beginPath();
	ctx.moveTo(X0,Y0+h*N);
	ctx.lineTo(X0+N*width,Y0+h*N);
	ctx.stroke();
}
//little hor
ctx.strokeStyle="#444444";
for(var i=1;i<3;i++)
{
	ctx.beginPath();
	ctx.moveTo(X0,Y0+i*N*~~(height/3));
	ctx.lineTo(X0+N*width,Y0+i*N*~~(height/3));
	ctx.stroke();
}
//more verts
ctx.strokeStyle="#444444";
if (DIM >= 5 && DIM%2==1)
    for (var i = 1; i < 9; i++)
    {
        if(i!=3 && i!=6)
		{
			ctx.beginPath();
			ctx.moveTo(X0 + i * N * ~~(width / 9), Y0);
			ctx.lineTo(X0 + i * N * ~~(width / 9), Y0 + N * height);
			ctx.stroke();	
		}
    }
//big vert//big blue
ctx.strokeStyle="#2222FF";
ctx.lineWidth=2;
	ctx.beginPath();
	ctx.moveTo( X0 + N * ~~(width / 3), Y0);
	ctx.lineTo(X0 + N * ~~(width / 3), Y0 + N * height);
	ctx.stroke();
	/////////////
	ctx.beginPath();
	ctx.moveTo( X0 + 2 * N * ~~(width / 3), Y0);
	ctx.lineTo(X0 + 2 * N * ~~(width / 3), Y0 + N * height);
	ctx.stroke();

//plus signs
ctx.strokeStyle="#000000";
ctx.lineWidth=2;
for(var w=0;w<=width;w+=3)
{for(var h=0;h<=height;h+=3)
{
	ctx.beginPath();
	ctx.moveTo(X0 + N * w - 5, Y0 + N * h);
	ctx.lineTo(X0 + N * w + 5, Y0 + N * h);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(X0 + N * w, Y0 + N * h - 5);
	ctx.lineTo(X0 + N * w, Y0 + N * h + 5);
	ctx.stroke();

}}


}

function drawDot(x,y)
{

ctx.strokeStyle=ctx.fillStyle="#000000";
ctx.lineWidth=1;

ctx.beginPath();
ctx.arc(X0+x*N+~~(N/2),Y0+y*N+~~(N/2),~~(3*N/8)-1,0,2*Math.PI);
//ctx.fillStyle = "#000000";
ctx.fill();
ctx.stroke();
}

function drawCross(x,y)
{
 ctx.strokeStyle="#FF0000";
 ctx.lineWidth=1;
 
 ctx.beginPath();
	ctx.moveTo(X0+N*x+2,Y0+N*y+2);
	ctx.lineTo(X0+N*x+N-2,Y0+N*y+N-2);
	ctx.moveTo( X0 + N *x + N - 2, Y0 + N * y + 2);
	ctx.lineTo(X0 + N * x + 2, Y0 + N * y + N - 2);
	ctx.stroke();
 
}

function drawClear(x,y)
{
ctx.strokeStyle=ctx.fillStyle="#FFFFFF";
ctx.lineWidth=1;
 
ctx.beginPath();
ctx.rect(X0+N*x+2,Y0+N*y+2,N-4,N-4);
ctx.fill();
ctx.stroke();
}
//draws the numbers for the order of eliminated points
function drawElim(x,y)
{
var num=pointToNum(x,y);
ctx.fillStyle="#FF0000";
ctx.font=~~(3*N/4)+'pt Monospace';
if(numelim[num]<10)
{
ctx.fillText(numelim[num], X0+N*x+~~(3*N/16),Y0+N*y+~~(13*N/16));
}
else if(numelim[num]>9 && numelim[num]<36)
{
ctx.fillText(String.fromCharCode(55+numelim[num]), X0+N*x+~~(3*N/16),Y0+N*y+~~(13*N/16));
}
else if(numelim[num]>35 && numelim[num]<62)
{
ctx.fillText(String.fromCharCode(61+numelim[num]), X0+N*x+~~(3*N/16),Y0+N*y+~~(13*N/16)-1);
}
else
drawCross(x,y);
}
//#endregion
//}

//

"use strict";

var cursorX = 32;
var cursorY = 32;
var mouseX = 32;
var mouseY = 32;
var shapes = new Array(256);
var totalShapes = 0;
var activeVertex = 0;
var activeShape = 1;
var wasmModule = {};
var wasmMemory = {};
var offset = 0;

class Vertex {
    constructor() {
	this.x = 0;
	this.y = 0;
    }
}

class Shape {
    constructor(pivotX, pivotY) {
	this.vertex = new Array(8);
	this.usedVertex = 4;

	this.vertex[0] = new Vertex();
	this.vertex[1] = new Vertex();
	this.vertex[2] = new Vertex();
	this.vertex[3] = new Vertex();

	this.vertex[0].x = pivotX - 1;
	this.vertex[0].y = pivotY - 1;
	this.vertex[1].x = pivotX + 1;
	this.vertex[1].y = pivotY - 1;
	this.vertex[2].x = pivotX + 1;
	this.vertex[2].y = pivotY + 1;
	this.vertex[3].x = pivotX - 1;
	this.vertex[3].y = pivotY + 1;		



	this.floorHeightLength = 0;
	this.ceilingHeight = 0;
	this.ceilingHeightLength = 0;
	this.floorTexture = 0;
	this.ceilingTexture = 0;
	this.floorRepetitionTexture = 0;
	this.ceilingRepetitionTexture = 0;
	this.mainTexture = 0;
	this.mainTextureScale = 0;
    }
}


function initPalette() {
    

}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function httpPost(theUrl, data) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", theUrl, false );
    xmlHttp.send( data + "\n\n" );
    return xmlHttp.responseText;
}

function updateWASM() {
    offset+= 5;
    const preview = document.querySelector('canvas#preview');
    
    wasmModule.getPixels(wasmMemory, offset, 320, 200);
    
    var index = 0;
    var x = 0;
    var y = 0;
    var ctx = preview.getContext('2d');
    ctx.strokeStyle = '#F00';
    ctx.lineWidth = 1;

    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#999';

    ctx.fillRect(0, 0, 320, 200);
    ctx.stroke();

    ctx.fillStyle = '#FFF';
    
    for (y = 0; y < 200; ++y ) {
	for (x = 0; x < 320; ++x ) {
	    if (wasmMemory[index]) {
		ctx.fillRect( x, y, 1, 1);
	    }
	    index++;
	}
    }
    
    ctx.stroke();
}

function initWASM() {
	
    // Check for wasm support.
    if (!('WebAssembly' in window)) {
	alert('you need a browser with wasm support enabled :(');
    }
    
    var request = new XMLHttpRequest();
    
    var importObject = {
            env: {
            'memoryBase': 0,
            'tableBase': 0,
            'memory': new WebAssembly.Memory({initial: 256}),
            'table': new WebAssembly.Table({initial: 256, element: 'anyfunc'}),
            abort: function(){},
            }
       }
    
    request.open('GET', 'demo.wasm');
    request.responseType = 'arraybuffer';
    request.send();

    request.onload = function() {
      var bytes = request.response;
      WebAssembly.instantiate(bytes, importObject)
      .then(results => {
    	  
    	  var exports = results.instance.exports; // the exports of that instance
	  var Module = results.instance.module;
	  var func = exports.func;

	  
	  wasmModule = exports;	  		
	  
	  const memoryArray = new Uint8Array(importObject.env.memory.buffer);
	  wasmMemory = memoryArray;
	  updateWASM();
      });
    };
}

function init() {
    addNewShape();
    addNewShape();
    totalShapes = 2;
    initWASM();

}



function draw() {

    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
	var ctx = canvas.getContext('2d');
	var x = 0;
	var y = 0;
	var lastIndex = -1;
	var entry;
	ctx.lineWidth = 1;
	ctx.fillStyle = '#FFF';
	ctx.strokeStyle = '#999';
	for ( y = 0; y < 64; ++y ) {
	    for ( x = 0; x < 64; ++x ) {
		ctx.fillRect( x * 8, y * 8, 8, 8);
		ctx.strokeRect( x * 8, y * 8, 8, 8);
	    }
	}
	
	ctx.strokeStyle = '#000';
	ctx.beginPath();
	ctx.moveTo(0, cursorY * 8);
	ctx.lineTo(64 *8, (cursorY * 8));
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo((cursorX * 8), 0);
	ctx.lineTo((cursorX * 8), 64 * 8);
	ctx.stroke();

	ctx.strokeStyle = '#F00';
	ctx.beginPath();
	ctx.moveTo(0, mouseY * 8);
	ctx.lineTo(64 *8, (mouseY * 8));
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo((mouseX * 8), 0);
	ctx.lineTo((mouseX * 8), 64 * 8);
	ctx.stroke();


	var index = 0;
	
	for ( index = 1; index < totalShapes; ++index ) { 
	    var shape = shapes[index];
	    
	    if (index == activeShape) {
		ctx.strokeStyle = '#0F0';
	    } else {
		ctx.strokeStyle = '#000';
	    }
	    
	    ctx.beginPath();
	    ctx.moveTo( shape.vertex[0].x * 8, shape.vertex[0].y * 8);
	    var c = 0;

	    for ( c = 1; c < shape.usedVertex; ++c ) {
		ctx.lineTo( shape.vertex[c].x * 8, shape.vertex[c].y * 8);

		if (index == activeShape ) {
		    if ( c == activeVertex ) {			
			ctx.fillStyle = '#0F0';
		    } else {
			ctx.fillStyle = '#00F';			
		    }
		} else {
		    ctx.fillStyle = '#000';
		}
		
		ctx.fillRect( shape.vertex[c].x * 8 - 4, shape.vertex[c].y * 8 - 4, 8, 8);	
		
	    }

	    ctx.lineTo( shape.vertex[0].x * 8, shape.vertex[0].y * 8);

	    if (index == activeShape ) {
		if ( 0 == activeVertex ) {			
		    ctx.fillStyle = '#0F0';
		} else {
		    ctx.fillStyle = '#00F';			
		}
	    } else {
		ctx.fillStyle = '#000';
	    }	    
	    
	    ctx.fillRect( shape.vertex[0].x * 8 - 4, shape.vertex[0].y * 8 - 4, 8, 8);		    
	    
	    ctx.stroke();   
	}
    }

    document.getElementById("shape").value = activeShape;
    document.getElementById("shape").min = 1;
    document.getElementById("shape").max = totalShapes - 1;
    document.getElementById("shape-entry").innerHTML = activeShape;


    document.getElementById("vertex").value = activeVertex;
    document.getElementById("vertex").min = 0;
    document.getElementById("vertex").max = shapes[activeShape].usedVertex - 1;
    document.getElementById("vertex-entry").innerHTML = activeVertex;    
}

function updateActiveShape(shapeNum) {
    activeShape = shapeNum;
    activeVertex = 0;
    draw();
}


function updateActiveVertex(vertexNum) {
    activeVertex = vertexNum;
    draw();    
}

function updateMousePosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = Math.round((event.clientX - 4 - rect.left) / 8);
    mouseY = Math.round((event.clientY - 4 - rect.top) / 8);
    draw();
}

function setCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    cursorX = Math.round((event.clientX - 4 - rect.left) / 8);
    cursorY = Math.round((event.clientY - 4 - rect.top) / 8);
    draw();
    updateWASM();
}

function addNewShape() {
    var shape = new Shape(cursorX, cursorY);
    ++totalShapes;
    shapes[totalShapes- 1] = shape;
    activeVertex = 0;
    activeShape = totalShapes - 1;
    draw();
}

function addNewVertex() {

    if (shapes[activeShape].usedVertex >= 8 ) {
	return;
    }

    shapes[activeShape].usedVertex++;
    var vertex = new Vertex();
    vertex.x = cursorX;
    vertex.y = cursorY;
    shapes[activeShape].vertex[shapes[activeShape].usedVertex - 1] = vertex;
    activeVertex = shapes[activeShape].usedVertex - 1;
    draw();    
}

function moveVertex() {
    shapes[activeShape].vertex[activeVertex].x = cursorX;
    shapes[activeShape].vertex[activeVertex].y = cursorY;
    draw();
}

function deleteShape() {
    if (totalShapes <= 2 ) {
	return;
    }
    
    
    shapes.splice(activeShape, 1)
    totalShapes--;
    activeShape = totalShapes - 1;
    draw();
}

function deleteVertex() {

    if ( shapes[activeShape].usedVertex <= 3) {
	return;
    }

    shapes[activeShape].usedVertex--;
    activeVertex = shapes[activeShape].usedVertex - 1;    
    draw();
}


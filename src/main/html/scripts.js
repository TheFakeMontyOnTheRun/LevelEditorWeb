"use strict";

var cursorX = 32;
var cursorY = 32;
var shapes = new Array(256);
var totalShapes = 0;
var activeVertex = 0;
var activeShape = 1;

class Vertex {
    constructor() {
	this.x = 0;
	this.y = 0;
    }
}

class Shape {
    constructor(pivotX, pivotY) {
	this.vertex = new Array(8);
	this.usedVertex = 2;

	this.vertex[0] = new Vertex();
	this.vertex[1] = new Vertex();

	this.vertex[0].x = pivotX - 1;
	this.vertex[0].y = pivotY - 1;
	this.vertex[1].x = pivotX + 1;
	this.vertex[1].y = pivotY + 1;



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

function initWASM() {
    // Check for wasm support.
    if (!('WebAssembly' in window)) {
	alert('you need a browser with wasm support enabled :(');
    }
    
    // Loads a WebAssembly dynamic library, returns a promise.
    // imports is an optional imports object
    function loadWebAssembly(filename, imports) {
	// Fetch the file and compile it
	return fetch(filename)
	    .then(response => response.arrayBuffer())
	    .then(buffer => WebAssembly.compile(buffer))
	    .then(module => {
		    // Create the imports for the module, including the
		    // standard dynamic library imports
		    imports = imports || {};
		    imports.env = imports.env || {};
		    imports.env.memoryBase = imports.env.memoryBase || 0;
		    imports.env.tableBase = imports.env.tableBase || 0;
		    if (!imports.env.memory) {
			imports.env.memory = new WebAssembly.Memory({ initial: 256 });
		    }
		    if (!imports.env.table) {
			imports.env.table = new WebAssembly.Table({ initial: 0, element: 'anyfunc' });
		    }
		    // Create the instance.
		    return new WebAssembly.Instance(module, imports);
		});
    }
    
    // Main part of this example, loads the module and uses it.
    loadWebAssembly('demo.wasm')
	.then(instance => {
		var exports = instance.exports; // the exports of that instance
		var func = exports.func;
		
		
		alert("func is " + func());
	    }
	    );
    
}

function init() {
    addNewShape();
    addNewShape();
    totalShapes = 2;
    //initWASM();
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

	ctx.strokeStyle = '#F00';
	ctx.beginPath();
	ctx.moveTo(0, cursorY * 8);
	ctx.lineTo(64 *8, (cursorY * 8));
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo((cursorX * 8), 0);
	ctx.lineTo((cursorX * 8), 64 * 8);
	ctx.stroke();


	var index = 0;
	
	for ( index = 1; index < totalShapes; ++index ) { 
	    var shape = shapes[index];
	    
	    if (index == activeShape) {
		ctx.strokeStyle = '#0F0';
	    } else {
		ctx.strokeStyle = '#000';
	    }
	    
	    var c = 0;

	    for ( c = 1; c < shape.usedVertex; ++c ) {

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


	    ctx.beginPath();
	    ctx.rect( shape.vertex[0].x * 8, shape.vertex[0].y * 8, (shape.vertex[1].x - shape.vertex[0].x) * 8, (shape.vertex[1].y - shape.vertex[0].y) * 8);
	    ctx.stroke();

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

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    cursorX = Math.round((event.clientX - 4 - rect.left) / 8);
    cursorY = Math.round((event.clientY - 4 - rect.top) / 8);
    draw();
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


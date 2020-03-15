"use strict";

var map = new Array( 64 * 64 );
var palette = new Array( 256 );

class Entry {
    constructor() {
	this.geometryType = 0;
	this.floorHeight = 0;
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
    var c = 0;
    for( c = 0; c < 256; ++c ) {
	var entry = new Entry();
	palette[ c ] = entry;
    }
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
    var x = 0;
    var y = 0;
    for ( y = 0; y < 64; ++y ) {
	for ( x = 0; x < 64; ++x ) {
	    map[ ( y * 64 ) +x  ] = 0;
	}
    }
    initPalette();
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
	for ( y = 0; y < 64; ++y ) {
	    for ( x = 0; x < 64; ++x ) {

		const index =  map[ ( y * 64 ) + x  ] ;
		var r = index;
		var g = (index * 16) % 256;
		var b = 256 - index;


		if (index != lastIndex) {
		    lastIndex = index;
		    entry = palette[index];

		    switch(entry.geometryType) {
		    case 0: //cube
			ctx.fillStyle = 'rgb( ' + r + ',' + g + ',' + b + ')';
			ctx.strokeStyle = 'rgb( ' + (256 - r) + ',' + (256 - g) + ',' + (256 - b) + ')';
			break;
		    case 1: //near left
		    case 2: //near right
			ctx.fillStyle = 'rgb( ' + (256 - r) + ',' + (256 - g) + ',' + (256 - b) + ')';
			ctx.strokeStyle = 'rgb( ' + r + ',' + g + ',' + b + ')';
			break;
		    }
		}


		switch(entry.geometryType) {
		case 0: //cube
		    ctx.fillRect( x * 8, y * 8, 8, 8);
		    break;
		case 1: //near left
		    ctx.fillRect( x * 8, y * 8, 8, 8);
		    ctx.beginPath();
		    ctx.moveTo((x * 8), (y * 8) + 8);
		    ctx.lineTo((x * 8) + 8, (y * 8));
		    ctx.stroke();
		    break;
		case 2: //near right
		    ctx.fillRect( x * 8, y * 8, 8, 8);
		    ctx.beginPath();
		    ctx.moveTo((x * 8), (y * 8));
		    ctx.lineTo((x * 8) + 8, (y * 8) + 8);
		    ctx.stroke();
		    break;
		}

		ctx.strokeStyle = '#000';
		ctx.strokeRect( x * 8, y * 8, 8, 8);
	    }
	}    	
	ctx.strokeRect( 0, 0, 1024, 1024);
    }
}


function setGeometryType(newGeometryType) {
    var combo = document.getElementById('geometryType');
    var slider = document.getElementById('paletteEntry');
    var entryIndex = slider.value;
    var entry = palette[entryIndex];

    entry.geometryType = newGeometryType;

    paletteEntry[entryIndex] = entry;
}

function updateActivePaletteEntry() {
    var combo = document.getElementById('geometryType');
    var slider = document.getElementById('paletteEntry');
    var entryIndex = slider.value;
    var entry = palette[entryIndex];

    combo.selectedIndex = entry.geometryType;
}

function getIndexFromCursorPosition(canvas, e, slider) {
    const x = Math.round((event.clientX - 4 - rect.left) / 8);
    const y = Math.round((event.clientY - 4 - rect.top) / 8);
    const value = map[ ( y * 64 ) + x  ];
    combo.selectedIndex = value;
}

function getCursorPosition(canvas, event, value) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((event.clientX - 4 - rect.left) / 8);
    const y = Math.round((event.clientY - 4 - rect.top) / 8);
    map[ ( y * 64 ) + x  ] = value;
    draw();
}
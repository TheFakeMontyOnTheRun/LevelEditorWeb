"use strict";

var map = new Array( 128 * 128 );

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function httpPost(theUrl, data)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", theUrl, false ); // false for synchronous request
    xmlHttp.send( data + "\n\n" );
    return xmlHttp.responseText;
}

function init() {
    var x = 0;
    var y = 0;
    for ( y = 0; y < 128; ++y ) {
	for ( x = 0; x < 128; ++x ) {
	    map[ ( y * 128 ) +x  ] = 0;
	}
    }
}

function draw() {
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
	var ctx = canvas.getContext('2d');
	var x = 0;
	var y = 0;
	
	for ( y = 0; y < 128; ++y ) {
	    for ( x = 0; x < 128; ++x ) {
		if ( map[ ( y * 128 ) +x  ] == 1) {
		    ctx.fillRect( x * 4, y * 4, 4, 4);
		} else {
		    ctx.strokeRect( x * 4, y * 4, 4, 4);
		}
	    }
	}    	
	ctx.strokeRect( 0, 0, 1024, 1024);
    }
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) / 4);
    const y = Math.round((event.clientY - rect.top) / 4);
    map[ ( y * 128 ) + x  ] = 1;
    draw();
}
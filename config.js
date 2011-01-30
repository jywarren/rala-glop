///////////////////////////////////
// config.js
///////////////////////////////////

//global variables

var frame = 0, width = 800, height = 600, padding = 0, editmode = false, dragging = false, supermode = false, currentObject = "", pointerLabel = "", on_object = false, mouseDown = false, mouseUp = false, draggedObject = "", lastObject = "", clickFrame = 0, releaseFrame, mode = "layout", modifier = false, arrow_drawing_box = "", clickX, clickY, globalDragging = false, selectedObjects = [], glyphs = [], drag_x, drag_y, single_key, startTime = new Date(), time, fps_frames = 0

globalMouseMoving = false,
globalMouseOver = false, // If the mouse is Over any object
globalDragging = false,	
globalEditMode = 0 // 			0 = normal, 1 = one glop exploded, 2 = a glop in editingmode , 3 dragging organs



//canvas variables for wrapper
$('canvas').width = width
$('canvas').height = height
canvas = document.getElementById('canvas').getContext('2d')

$('pointerLabel').absolutize()

canvas.globalAlpha = 0.8

//resizes window, is called from html body
function resizeCanvas(){
	$('canvas').width = document.viewport.getWidth()-padding*2
	$('canvas').height = document.viewport.getHeight()-padding*2-100
	$$('body')[0].style.width = (document.viewport.getWidth()-padding*2-2)+"px"
	width = document.viewport.getWidth()-padding*2
	height = document.viewport.getHeight()-padding*2-100
}

// run & stop // does not work right now
function toggle_mode() {
	if (mode == 'run') {
		mode = 'layout'
		$('run_button').addClassName('green')
		$('run_button').innerHTML = "Run"
	} else {
		mode = 'run'
		$('run_button').removeClassName('green')
		$('run_button').innerHTML = "Stop"
	}
}

function isNthFrame(num) {
	return ((frame % num) == 0);
}

function toggle(object) {
	if (object == true) {
		object = false
	} else if (object == false) {
		object = true
	}
	return object
}

//clones a complete object
function deep_clone(obj) {
    var c = {};
    for (var i in obj) {
        var prop = obj[i];
 
        if (prop instanceof Array) {
			c[i] = prop.slice();
        } else if (typeof prop == 'object') {
           c[i] = deep_clone(prop);
		} else {
           c[i] = prop;
        }
    }
    return c;
}

function object_clone(obj){
	obj = deep_clone(obj)
	obj.color = randomColor()
	obj.rotation = randomRotation()
	obj.travelVector = new Vector(Math.floor(Math.random()-0.5)*Math.random(obj.obj_id*frame)*10+5,Math.floor(Math.random()-0.5)*Math.random(obj.obj_id/frame)*10+5)
	obj.obj_id = highest_id() + 1
	return obj
}

function color_from_string(string) {
	return "#"+(parseInt((string),36).toString(16)+"ab2828").truncate(6,"")
}

function randomColor() {
	return "rgb("+Math.round(Math.random(frame)*255)+","+Math.round(Math.random(frame)*255)+","+Math.round(Math.random(frame)*255)+")"
}
load_next_script()
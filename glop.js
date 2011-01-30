var frame = 0, width, height, editmode = false, dragging = false, currentObject = "", pointerLabel = "", on_object = false, mouseDown = false, mouseUp = false, draggedObject = "", lastObject = "", clickFrame = 0, releaseFrame, mode = "layout", modifier = false, arrow_drawing_box = "", token_mod = false, clickX, clickY, drag_x, drag_y, globalDragging = false, selectedObjects = [],single_key,glopics = [], stepping = false, trigger_step = false, testingmode = false

canvas.globalAlpha = 0.8
$('pointerLabel').absolutize()

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

function highest_id() {
	var high = 0
	objects.each(function(object) {
		if (object.obj_id > high) high = object.obj_id
	})
	return high
}

function overlaps(x1,y1,x2,y2,fudge) {
	if (x2 > x1-fudge && x2 < x1+fudge) {
		if (y2 > y1-fudge && y2 < y1+fudge) {
	  		return true
		} else {
			return false
		}
	} else {
		return false
	}
}

//do two rects overlap? Accepts 2 four-item arrays, [x1,y1,x2,y2]
function rect_overlaps(rect_a,rect_b) {

	var ax1 = Math.min(rect_a[0],rect_a[2])
	var ay1 = Math.min(rect_a[3],rect_a[1])
	var ax2 = Math.max(rect_a[0],rect_a[2])
	var ay2 = Math.max(rect_a[3],rect_a[1])
	
	var bx1 = Math.min(rect_b[0],rect_b[2])
	var by1 = Math.min(rect_b[3],rect_b[1])
	var bx2 = Math.max(rect_b[0],rect_b[2])
	var by2 = Math.max(rect_b[3],rect_b[1])
	
	if (ax1 > bx2 || ax2 < bx1 || ay1 > by2 || ay2 < by1) {
		return false
	} else {
		return true
	}
}

function get_object(id) {
	var output
	objects.each(function(object) { 
		if (object.obj_id == id) {
			output = object
		}
	})
	return output
}

function crosshairs() {
	beginPath()
	moveTo(pointerX,pointerY-10)
	lineTo(pointerX,pointerY+10)
	moveTo(pointerX-10,pointerY)
	lineTo(pointerX+10,pointerY)
	stroke()
}

function toggle(object) {
	if (object == true) {
		object = false
	} else if (object == false) {
		object = true
	}
	return object
}

function clickLength() {
	return releaseFrame-clickFrame
}

function end_editmode() {
	editmode = false
	unexplode_all()
}

function randomColor() {
	return "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")"
}

function pointer_label() {
	if (pointerLabel == "") {
		$('pointerLabel').update("")
		$('pointerLabel').hide()
	} else {
		$('pointerLabel').update("<span>"+pointerLabel+"</span>")
		$('pointerLabel').style.left = (pointerX+padding)+"px"
		$('pointerLabel').style.top = (pointerY+padding-30)+"px"
		$('pointerLabel').show()
	}
}

function step() {
	trigger_step = true
}

function draw() {
	if (stepping == false || (stepping && trigger_step)) {
			trigger_step = false
		clear()
		width = document.viewport.getWidth()
		height = document.viewport.getHeight()
		$('canvas').width = width
		$('canvas').height = height
		$$('body')[0].style.width = width+"px"
		canvas.globalAlpha = 0.8
		crosshairs()
		frame += 1
		mouseEventManager.dragObserver()
		objects.each(function(object) { 
			object.draw()
			if (overlaps(object.x,object.y,pointerX,pointerY,0)) {
				object.highlight()
			}
			//check for drag selecting
			if (globalDragging && within([object.y-(object.h/2),object.x+(object.w/2),object.y+(object.h/2),object.x-(object.w/2)],[clickY,pointerX,pointerY,clickX])) {
				if (!object.is_selected) {
					object.is_selected = true
					selectedObjects.push(object)
				}
			}
		})
		glopics.each(function(glopic,index) {
			glopic.draw()
			if (glopic.lifetime > 0) glopic.lifetime -= 1
			if (glopic.lifetime == 0) {
				glopics.splice(index,1)
				delete glopic
			}
		})
		// objects.each(function(object){
		// 	arrow(object)
		// })
		pointer_label()
		if (mouseDown) {
			mouseDown = false
		}
		if (mouseUp) {
			mouseUp = false
		}
	}
}

function jsonify(input,newlines) {
	if (newlines == null) var newline = ""
	else var newline = "\r"
	var json = ""
	if (input instanceof Array) {
		var string = ''
		input.each(function(item) {
			string += jsonify(item)+","+newline
		})
		string = string.truncate(string.length-1,'')
		json += "["+string+"]"
	} else if (Object.isString(input)) {
		json += "'"+String(input).escapeHTML()+"'"
	} else if (Object.isNumber(input)) {
		json += String(input)
	} else if (typeof input == 'object') {
		var string = ''
		Object.keys(input).each(function(key,index) {
			string += key+": "+jsonify(Object.values(input)[index])+", "+newline
		})
		string.truncate(string.length-1)
		json += "{"+string+"}"
	} else {
		json += String(input).escapeHTML()
	}
	return json
}

function object_clone(obj){
	obj = deep_clone(obj)
	obj.initialize()
	return obj
}

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

///////////////////////////////////
//Fire it up!
///////////////////////////////////

//resizes canvas stage at startup after loading all .js files. later it is called from html
// resizeCanvas()

var objects = []

var listeners = []

mouseEventManager = new MouseEventManager("hi", listeners, 0, 0, false)

var box = new Box
//Load any preloaded object into the scene
// if ($('dropject').value != '') {
// 	Object.extend(box,$('dropject').value.evalJSON())
// }
// objects.push(box)

// seconds between redraws:
new PeriodicalExecuter(draw, 0.025);
load_next_script()
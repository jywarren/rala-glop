///////////////////////////////////
// Catch events from Prototype and other places
///////////////////////////////////

$('canvas').observe('mousedown', mousedown)
$('canvas').observe('mouseup', mouseup)
$('canvas').observe('dblclick', doubleclick)

// Track mouse movement:
$('canvas').observe('mousemove', mousemove)
var pointerX = 0, pointerY = 0
function mousemove(event) { 
	// This gets called before loading glop.js sometimes:
	if (typeof mouseEventManager != 'undefined') {
		pointerX = Event.pointerX(event)-padding
		pointerY = Event.pointerY(event)-padding
		mouseEventManager.mouseMove()
	}
}

///////////////////////////////////
// Pass events to MouseEventManager and others
///////////////////////////////////

function doubleclick(event) {
	mouseEventManager.doubleClick()
}
function clickLength() {
	return releaseFrame-clickFrame
}
function mousedown(event) {
	mouseEventManager.mouseDown()
}
function mouseup() {
	mouseEventManager.mouseUp()
}

////////////////////
// MouseEventManager
////////////////////

var MouseEventManager = Class.create({
	initialize: function(_name, _listeners, _mouseDownX, _mouseDownY, _dragging) {
		name = _name
		this.listeners = _listeners
		this.dragging = _dragging
	},
	dragX: 0,
	dragY: 0,
	mouseDownX: 0,
	mouseDownY: 0,
	startDragOnObject: false,
	selectedObjects: [],
	mouseIsDown: false,
	selecting: false,
	listeners: [],
	addListener: function(Object){
		listeners[listeners.length] = Object;
	},
	dragObserver: function() {
		if (this.mouseIsDown) {
			// check to see if we've been dragging:
			// console.log(this.dragX+','+this.dragY)
			// console.log(pointerX+','+pointerY)
			this.dragX = quantize(pointerX - this.mouseDownX,50)
			this.dragY = quantize(pointerY - this.mouseDownY,50)
			if (Math.abs(this.dragX) > 2 || Math.abs(this.dragY) > 2) {
				this.dragging = true
				this.mouseDrag()
			}
		}
		this.selectedObjects.each(function(object) {
			// object.highlight('purple')
		})
	},
	removeListener: function(){},	
	mouseMove: function(){},
	mouseDown: function(){
		this.mouseIsDown = true
		this.mouseDownX = pointerX
		this.mouseDownY = pointerY
		parent = this
		var draggingSelectedObjects = false
		this.selectedObjects.each(function(object) {
			if (overlaps(object.x,object.y,pointerX,pointerY,25)) {
				draggingSelectedObjects = true
			}
		})
		if (!draggingSelectedObjects) this.selectedObjects = []
		listeners.each(function(object){
			if (overlaps(object.x,object.y,pointerX,pointerY,25)) {
				object.mouseDown()
				parent.startDragOnObject = object
			}
		})
		if (this.startDragOnObject ==  false) {
			this.selectedObjects = []
		}
	},
	mouseDrag: function(){
		// draw the drag rectangle if there are no current selections:
		if (this.startDragOnObject) {
			if (this.selectedObjects.length > 0) {
				this.selectedObjects.each(function(object){
					object.mouseDrag()
				})	
			} else {
				this.selectedObjects.push(this.startDragOnObject)
				this.startDragOnObject.mouseDrag()
			}
		} else {
			// group selection:
			this.selecting = true
			// draw selection box:
			canvas.save()
			canvas.globalAlpha = 0.2
			strokeRect(this.mouseDownX,this.mouseDownY,pointerX-this.mouseDownX,pointerY-this.mouseDownY)
			fillStyle("#ccc")
			rect(this.mouseDownX,this.mouseDownY,pointerX-this.mouseDownX,pointerY-this.mouseDownY)
			canvas.restore()
			parent = this
			objects.each(function(object) {
				if (parent.dragging && rect_overlaps([object.x-(object.w/2),object.y-(object.h/2),object.x+(object.w/2),object.y+(object.h/2)],[parent.mouseDownX,parent.mouseDownY,pointerX,pointerY])) {
					object.highlight('purple')
				}
			})
		}
	},
	mouseUp: function(){
		// re-initialize lots of states:
		this.mouseIsDown = false
		this.dragX = ""
		this.dragY = ""
		this.startDragOnObject = false
		parent = this
		// tell all listeners to mouseUp 
		listeners.each(function(object) {
			if (parent.selecting && rect_overlaps([object.x-(object.w/2),object.y-(object.h/2),object.x+(object.w/2),object.y+(object.h/2)],[parent.mouseDownX,parent.mouseDownY,pointerX,pointerY])) {
				parent.selectedObjects.push(object)
			}
			object.mouseUp()
		})
		this.mouseDownX = ""
		this.mouseDownY = ""
		this.dragging = false
		this.selecting = false
	},
	doubleClick: function(){
		listeners.each(function(object) {
			object.doubleClick()
		})		
	},
	isSelected: function(obj) {
		
	}
});

////////////////////
// Key events
////////////////////


Event.observe(document, 'keypress', function(e) {
	var code;
	if (!e) var e = window.event;
	if (e.keyCode) code = e.keyCode;
	else if (e.which) code = e.which;
	var character = String.fromCharCode(code);
	// alert('Character was ' + character);
	if (character == "a") {
		modifier = true
	}
	if (character == "t") {
		token_mod = true
	}
	if (character = "c") {
		single_key = "c"
	}
	if (character == "s") {
		step()
		alert('step')
	}
});
Event.observe(document, 'keyup', function() {
	modifier = false
	token_mod = false
	switch (single_key) {
		case "c":
			// Copy all selected objects in-place
			var clonedObjects = []
			selectedObjects.each(function(object){
				var newbox = deep_clone(object)
				newbox.is_proto = false
				// Link child and parent in the clone:
				newbox.clone_parent = object
				object.clone_child = newbox
				newbox.obj_id = highest_id()+1
				newbox.outputs = []
				newbox.inputs = []
				newbox.is_selected = false
				objects.push(newbox)
				clonedObjects.push(newbox)
			})
			// Re-assign input obj_ids to new cloned versions
			clonedObjects.each(function(object){
				var clonedObject = object
				object.inputs = []
				object.clone_parent.inputs.each(function(input) {
					// determine if the referenced glyph is selected
					// ----code here----
					//create a token in the child object:
					var new_input = input.slice()
					new_input[0] = get_object(input[0]).clone_child.obj_id //[25,"w",1]
					clonedObject.inputs.push(new_input)
				})
				// Repeat for outputs:
				object.outputs = []
				object.clone_parent.outputs.each(function(output) {
					// determine if the referenced glyph is selected
					// ----code here----
					//create a token in the child object:
					var new_output = output.slice()
					new_output[0] = get_object(output[0]).clone_child.obj_id //[25,"w",1]
					clonedObject.outputs.push(new_output)
				})
			})
			// Clear out all the clone_parent/clone_child references:
			clonedObjects.each(function(object){
				object.clone_parent = null
			})
			selectedObjects.each(function(object){
				object.clone_child = null				
			})
		break
	}
	single_key = null
});
load_next_script()
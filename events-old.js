// Track mouse movement:
$('canvas').observe('mousemove', mousemove)
var pointerX = 0, pointerY = 0
function mousemove(event) { 
	pointerX = Event.pointerX(event)-padding
	pointerY = Event.pointerY(event)-padding
}

$('canvas').observe('mousedown', mousedown)
$('canvas').observe('mouseup', mouseup)
$('canvas').observe('dblclick', doubleclick)
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

function doubleclick(event) {
	var on_object = false
	objects.each(function(object) { 
		if (!on_object && overlaps(object.x,object.y,pointerX,pointerY,0)) {
			object.doubleclick()
			on_object = true
		}
	})
}

function drag() {
	if (dragging) {
		drag_x = quantize(pointerX - clickX,50)
		drag_y = quantize(pointerY - clickY,50)
		on_object = false
		objects.each(function(object) {
			if (object.is_selected) {
				// send drag to whole group
				selectedObjects.each(function(object) {
					object.dragging = true
					object.drag()
				})
			} else {
				object.drag()
				if (object.dragging) {
					lastObject = object
				}				
			}
		})		
	}
}

function mousedown(event) {
	mouseDown = true
	clickFrame = frame
	clickX = pointerX
	clickY = pointerY
	if (!dragging) {
		on_object = false
		objects.each(function(object) { 
			if (!on_object && overlaps(object.x,object.y,pointerX,pointerY,0)) {
				if ((editmode && object.exploded) || !Event.isLeftClick(event)) {
				} else if (Event.isLeftClick(event)) {
					// Begin dragging
					object.click()
					end_editmode()
					lastObject = object
					object.dragging = true
					dragging = true
				}
				on_object = true
			}
		})
		if (!on_object) {
			globalDragging = true
			selectedObjects.each(function(object) {
				object.is_selected = false
				object.old_x = null
				object.old_y = null
			})
			selectedObjects = []
		}
	}
}

function mouseup() {
	mouseUp = true
	mouseDown = false
	releaseFrame = frame
	globalDragging = false
	if (draggedObject != "") {
		// something is being dragged
		on_object = false
		// if it's an organ:
		if (draggedObject.className == "Organ" && clickLength() < 10) {
			unexplode_all()
			draggedObject.edit()
			pointerLabel = ""
		}
		objects.each(function(object) { 
			if (!on_object && overlaps(object.x,object.y,pointerX,pointerY,0)) {
				// copy the dragged object's code into a string parameter called 'code'
				if (Object.isString(draggedObject.code)) {
					var code = "'"+draggedObject.code+"'"
				} else {
					var code = draggedObject.code
				}
				eval("object."+draggedObject.organName+" = "+code)
				on_object = true
			}
			if (clickLength() < 10 && draggedObject.className != "Organ") {
				// Open editor
				unexplode_all()
				object.exploded = true
				lastObject = object
				object.rightclick()
			}
		})
		draggedObject = ""
	} else {
		// nothing is being dragged
		if (arrow_drawing_box != "") {
			arrow_drawing_box.mouseup()
			arrow_drawing_box = ""
		}
		if (!dragging && !on_object && !editmode) {
			end_editmode()
		} else if (!on_object && editmode) {			
			end_editmode()
			pointerLabel = ""
		}
		dragging = false
		objects.each(function(object) {
			object.dragging = false
			if (object.is_selected) {
				// alert('deselected')
				selectedObjects.each(function(object) {
					object.dragging = false
					object.old_x = null
					object.old_y = null
				})
			}
		})		
	}
}
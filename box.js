var Box = Class.create({
  initialize: function() {
	this.obj_id = highest_id() + 1
	mouseEventManager.addListener(this)
  },
  className: "Box",
  selected: false,
  is_proto: true,
  glyph: 'wire',
  shade: 220,
  h: 50,
  w: 50,
  x: 50,
  y: 50,
  old_x: -1,
  old_y: -1,
  inputs: [], // [[23,"n",2],[25,"w",1]]
  outputs: [],
  exploded: false,
  obj_id: "",
  dragging: false,
  rotation: 0,
  spin: 0,
  color: "#ddd",
  draw: function() {
    this.snap();
	if (mode == "run") this.run()
	this.shape()
  },
  run: function() {
	var all_outs_twos = true, me = this
	this.outputs.each(function(output) {
		if (output[2] != 2) all_outs_twos = false
	})
	if ((all_outs_twos || this.glyph == "crossover") && this.outputs.length > 0) {
		var no_ins_twos = true
		this.inputs.each(function(input) {
			if (input[2] == 2) no_ins_twos = false
		})
		if ((no_ins_twos || this.glyph == "crossover") && this.inputs.length > 0) {
			// darken shade by unit
			if (this.glyph != "crossover") this.shade = this.shade - 3
			// BEGIN different logic for different gates
				this.glyph_logic()
			// END different logic
			// clear the outputs of the incoming tokens:
			if (this.glyph != "crossover") {
				this.inputs.each(function(input) {
					get_object(input[0]).outputs.each(function(output) {
						if (output[0] == me.obj_id) output[2] = 2
					})
				})
			}
		}
	}
  },
  glyph_logic: function() {
		var output_token = this.inputs[0][2], me = this
		this.outputs.each(function(output) {
			output[2] = output_token
			// set the input token for the destination neighbor: 
			get_object(output[0]).inputs.each(function(input) {
				if (input[0] == me.obj_id) input[2] = output_token
			})
		})
		// clear out my inputs & corresponding neighbors' outputs:
		this.inputs[0][2] = 2 //only for wire
  },
  shape: function() {
    canvas.save()
	translate(this.x,this.y)
	rotate(this.rotation)
	fillStyle(this.color)
	rect(this.w/-2,this.h/-2,this.w,this.h)
	canvas.globalAlpha = 0.7
	fillStyle("rgb("+this.shade+","+this.shade+","+this.shade+")")
	rect(this.w/-2,this.h/-2,this.w,this.h)
	if (modifier) {
		strokeStyle("rgba(255,255,0,0.5)")
		lineWidth(8)
		strokeRect(this.w/-2,this.h/-2,this.w,this.h)
	}
	this.arrows();
	// These are RALA glyphs, not GLOP glyphs
	draw_glyph(this.glyph);
	canvas.restore()
  },
  doubleClick: function(){},
  mouseDown: function() {
  },
  mouseDrag: function(){
	if (modifier) {
		// note that this box is drawing a connector:
		arrow_drawing_box = this
		// draw the connector
		canvas.save()
			beginPath()
			moveTo(this.x,this.y)
			lineWidth(3)
			strokeStyle("purple")
			lineTo(pointerX,pointerY)
			stroke()
		canvas.restore()
	} else if (token_mod == false) {
		// is this a group drag?:
		if (this.old_x == -1 || this.old_y == -1) {
			// initialize the point of the beginning of the group drag:
			this.old_x = this.x
			this.old_y = this.y
		} else {
			// it is being dragged:
			this.x = this.old_x + mouseEventManager.dragX
			this.y = this.old_y + mouseEventManager.dragY
		}
	}
  },
  mouseUp: function() {
	this.old_x = -1
	this.old_y = -1
	if (this == arrow_drawing_box) {
		var me = this
		objects.each(function(object) { 
			if (overlaps(object.x,object.y,pointerX,pointerY,25)) {
				// determine where the object is:
				if (object.x == me.x) {
					if (object.y == me.y+50) {
						me.outputs.push([object.obj_id,"s",2])
						object.inputs.push([me.obj_id,"n",2])
					} else if (object.y == me.y-50) {
						me.outputs.push([object.obj_id,"n",2])
						object.inputs.push([me.obj_id,"s",2])
					}
				} else if (object.y == me.y) {
					if (object.x == me.x+50) {
						me.outputs.push([object.obj_id,"e",2])
						object.inputs.push([me.obj_id,"w",2])
					} else if (object.x == me.x-50) {
						me.outputs.push([object.obj_id,"w",2])
						object.inputs.push([me.obj_id,"e",2])
					}				
				}
			}
		})
	}
  },
  highlight: function(color) {
	if (typeof color == 'undefined') {
		color = "grey"
	}
    canvas.save()
	canvas.globalAlpha = 1
	strokeStyle(color)
	fillStyle(color)
	lineWidth(8)
	translate(this.x,this.y)
	rotate(this.rotation)
	rect(this.w/-2,this.h/-2,this.w,this.h)
	strokeRect(this.w/-2,this.h/-2,this.w,this.h)
	canvas.restore()
  },
  matrix_pos: [0,1],
  mx: function() {
	return Math.floor(this.x/50) //this needs work
  },
  my: function() {
	return Math.floor(this.y/50)
  },
  matrix: function() {
	new_mx = this.mx()
	new_my = this.my()
	matrix[matrix_pos[0],matrix_pos[1]] = 0
	matrix[new_mx,new_my] = this.obj_id
	this.matrix_pos = [new_mx,new_my]
  },
  arrows: function () {
	canvas.save()
	for (i=this.outputs.length-1;i>=0;i--) {
		// look for hover on arrow:
		var offset_x = 0,offset_y = 0
		switch(this.outputs[i][1]) {
			case "n":
				offset_y = -25
			break
			case "e":
				offset_x = 25
			break
			case "s":
				offset_y = 25
			break
			case "w":
				offset_x = -25
			break
		}
		// calculate overlap:
	  	if ((pointerX > this.x+offset_x-(15/2) && pointerX < this.x+offset_x+(15/2)) && mouseEventManager.mouseIsDown) {
	  		if (pointerY > this.y+offset_y-(15/2) && pointerY < this.y+offset_y+(15/2)) {
				this.outputs[i][2] = this.outputs[i][2]+1
				this.outputs[i][2] = this.outputs[i][2] % 3
				var me = this
				get_object(this.outputs[i][0]).inputs.each(function(input) {
					if (input[0] == me.obj_id) input[2] = me.outputs[i][2]
				})
	  		}
	  	}
		// Attempt to use GLOP glyph/layering system... 
		if (this.outputs.length > 0) {
			var glopic = new Glopic()
			glopic.parent = this
			glopic.output = this.outputs[i].slice()
			glopic.draw = function() {
				canvas.save()
				translate(this.parent.x,this.parent.y)
				// Gotta pass the object in as a reference:
				arrow(radians_from_cardinal(this.output[1]),color_from_token(this.output[2]))
				canvas.restore()
			}
			glopics.push(glopic)
		}
	}
	canvas.restore()
  },
  snap: function () {
    this.x = quantize(this.x,50)
    this.y = quantize(this.y,50)
  },
  get_token: function(direction,in_out) {
	var result
	if (in_out == "in") {
		this.inputs.each(function(input) {
			if (input[1] == direction) result = input
		})
	} else if (in_out == "out") {
		this.outputs.each(function(output) {
			if (output[1] == direction) result = output
		})
	}
	return result
  }
});
load_next_script()
// Helper methods specific to RALAGLOP environment

function rala_state() {
	output_string = ""
	objects.each(function(object,obj_index) {
		if (!object.is_proto) {
			// [glyph,matrix_x,matrix_y,[inputs],[outputs]]
			// ['crossover',13,2,[[23,"n",2],[25,"w",1]],[[23,"n",2],[25,"w",1]]]
			output_string += "['"+object.glyph+"',"+object.mx()+","+object.my()+",["
			object.inputs.each(function(input,index) {
				output_string += "["+input[0]+","+input[1]+","+input[2]+"]"
				if (index < object.inputs.length-1) output_string += ","
			})
			object.outputs.each(function(output,index) {
				output_string += "["+output[0]+","+output[1]+","+output[2]+"]"
				if (index < object.outputs.length-1) output_string += ","
			})
			output_string += "]]"
			if (obj_index < objects.length-1) output_string += ","
		}
	})
	if (output_string[output_string.length-1] == ",") output_string = output_string.substr(0,output_string.length-1)
	return output_string
}

function radians_from_cardinal(cardinal) {
	switch(cardinal) {
		case "n":
			return Math.PI/(-2)
		break
		case "e":
			return 0
		break
		case "s":
			return Math.PI/2
		break
		case "w":
			return Math.PI
		break
	}
}

function color_from_token(token) {
	switch(token) {
		case 0:
			return "blue"
		break
		case 1:
			return "red"
		break
		case 2:
			return "grey"
		break
	}
}

function draw_glyph(name) {
	canvas.save()
	fillStyle('white')
	strokeStyle('#666')
	lineWidth(2)
	beginPath()
	switch(name) {
		case 'crossover':
			canvas.moveTo(0,10)
			lineTo(10,0)
			lineTo(0,-10)
			lineTo(-10,0)
			lineTo(0,10)
		break
		case 'wire':
			canvas.arc(0,0,10,0,2*Math.PI,false)
		break
		case 'and':
			canvas.moveTo(-10,10)
			lineTo(0,10)
			canvas.arc(0,0,10,Math.PI/2,Math.PI/-2,true)
			lineTo(-10,-10)
			lineTo(-10,10)
		break
		case 'nand':
			canvas.moveTo(-10,10)
			lineTo(0,10)
			canvas.arc(0,0,10,Math.PI/2,Math.PI/-2,true)
			lineTo(-10,-10)
			lineTo(-10,10)
                        canvas.moveTo(13,0)
		        canvas.arc(10,0,3,0,2*Math.PI,true)
		break
		case 'xor':
			canvas.arc(0,0,10,0,2*Math.PI,false)
			canvas.moveTo(0,10)
			lineTo(0,-10)
			canvas.moveTo(10,0)
			lineTo(-10,0)
		break
		case 'or':
			canvas.moveTo(0,10)
			lineTo(0,-10)
			canvas.moveTo(10,0)
			lineTo(-10,0)
		break
		case 'delete':
			canvas.moveTo(0,0)
			canvas.lineTo(-8,6)
			canvas.arc(0,0,10,2.49809, 3.78509,false)
			canvas.lineTo(0,0)
			fillStyle('black')
			canvas.fill()
			beginPath()
			canvas.moveTo(10,0)
			canvas.arc(0,0,10,0,2*Math.PI,false)
		break
		case 'copy':
			canvas.moveTo(0,0)
			canvas.lineTo(-8,6)
			canvas.arc(0,0,10,2.49809, 3.78509,false)
			canvas.lineTo(0,0)
			canvas.moveTo(10,0)
			canvas.arc(0,0,10,0,2*Math.PI,false)
		break
	}	
	stroke()
	// fill()
	canvas.restore()
}

function arrow(radians,color) {
	canvas.save()
	rotate(radians)
	translate(25,0)
	beginPath()
	if (token_mod) {
		strokeStyle("rgba(255,255,0,0.5)")
		lineWidth(8)
	}
	moveTo(-3,0)
	lineTo(-3,5)
	lineTo(5.5,0)
	lineTo(-3,-5)
	lineTo(-3,0)
	lineTo(-7.5,0)
	canvas.arc(0,0,7.5,-1*Math.PI,Math.PI,false)
	fillStyle(color)
	fill()
	if (token_mod) stroke()
	canvas.restore()
}

function sign(val) {
	if (val > 0) return 1
	else if (val < 0) return -1
	else if (val == 0) return 0
}
function quantize(value,unit) {
	// return (unit * Math.floor(value/unit)) + unit/2

	// value += 25
	value = value/unit
	value = Math.round(value)
	return value * unit

	// var s = sign(value)
	// if (s == -1) {
	// 	return unit + s * (Math.abs(value) % unit)
	// } else {
	// 	return s % unit
	// }
}

function switch_direction(direction) {
	switch(direction) {
		case 'n':
			return 's'
		break
		case 's':
			return 'n'
		break
		case 'e':
			return 'w'
		break
		case 'w':
			return 'e'
		break
	}
}

function match_partner_token_to_me(object,direction,in_out) {
	if (in_out == 'in') {
		my_token = object.get_token(direction,in_out)
		get_object(my_token[0]).get_token(switch_direction(direction),'out')[2] = my_token[2]
	} else if (in_out == 'out') {
		my_token = object.get_token(direction,in_out)
		get_object(my_token[0]).get_token(switch_direction(direction),'in')[2] = my_token[2]
	}
}

function set_token(object,direction,in_out,value) {
	if (in_out == "in") {
		object.inputs.each(function(input) {
			if (input[1] == direction) input[2] = value
			// alert(input[2]+" "+direction)
		})
	} else if (in_out == "out") {
		object.outputs.each(function(output) {
			if (output[1] == direction) output[2] = value
		})
	}
}
load_next_script()
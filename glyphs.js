// create one default proto, 'wire' based on the initial class description of 'Box':
objects.push(box)

var and_glyph = object_clone(box)
and_glyph.x = 100
and_glyph.outputs = []
and_glyph.glyph = 'and'
and_glyph.glyph_logic = function() {
		var sum = 0
		this.inputs.each( function(input) {
			sum = sum + input[2]
		})
		var output_token, me = this
		if (sum == 2) output_token = 1
		else output_token = 0
		this.outputs.each(function(output) {
			output[2] = output_token
			// set the input token for the destination neighbor: 
			get_object(output[0]).inputs.each(function(input) {
				if (input[0] == me.obj_id) input[2] = output_token
			})
		})
		// clear out my inputs & corresponding neighbors' outputs:
		this.inputs.each( function(input) {
			input[2] = 2
		})
  }
objects.push(and_glyph)

var xor_glyph = object_clone(box)
xor_glyph.x = 250
xor_glyph.outputs = []
xor_glyph.glyph = 'xor'
xor_glyph.glyph_logic = function() {
		var sum = 0
		this.inputs.each( function(input) {
			sum = sum + input[2]
		})
		var output_token, me = this
		if (sum == 1) output_token = 1
		else output_token = 0
		this.outputs.each(function(output) {
			output[2] = output_token
			// set the input token for the destination neighbor: 
			get_object(output[0]).inputs.each(function(input) {
				if (input[0] == me.obj_id) input[2] = output_token
				// alert('passed '+output_token+' from '+me.obj_id+' to '+output[0]+'! Yay!')
				// mode = 'layout'
			})
		})
		// clear out my inputs & corresponding neighbors' outputs:
		this.inputs.each( function(input) {
			input[2] = 2
		})
  }
objects.push(xor_glyph)

var or_glyph = object_clone(box)
or_glyph.x = 200
or_glyph.outputs = []
or_glyph.glyph = 'or'
or_glyph.glyph_logic = function() {
		var sum = 0
		this.inputs.each( function(input) {
			sum = sum + input[2]
		})
		var output_token, me = this
		if (sum == 0) output_token = 0
		else output_token = 1
		this.outputs.each(function(output) {
			output[2] = output_token
			// set the input token for the destination neighbor: 
			get_object(output[0]).inputs.each(function(input) {
				if (input[0] == me.obj_id) input[2] = output_token
				// alert('passed '+output_token+' from '+me.obj_id+' to '+output[0]+'! Yay!')
				// mode = 'layout'
			})
		})
		// clear out my inputs & corresponding neighbors' outputs:
		this.inputs.each( function(input) {
			input[2] = 2
		})
  }
objects.push(or_glyph)

var crossover_glyph = object_clone(box)
crossover_glyph.x = 400
crossover_glyph.outputs = []
crossover_glyph.glyph = 'crossover'
crossover_glyph.glyph_logic = function() {
		var n_o_token = 4, e_o_token = 4, s_o_token = 4, w_o_token = 4
		var shade_vert = false, shade_horiz = false
		var me = this
		this.inputs.each( function(input) {
			if ((input[1] == 'n') && (me.get_token('s','out')[2] == 2)) {
				n_o_token = input[2]
				set_token(me,'s','out',n_o_token)
				match_partner_token_to_me(me,'s','out')
				shade_vert = true
			} else if ((input[1] == 's') && (me.get_token('n','out')[2] == 2)) {
				s_o_token = input[2]
				set_token(me,'n','out',s_o_token)
				match_partner_token_to_me(me,'n','out')
				shade_vert = true
			} else if ((input[1] == 'e') && (me.get_token('w','out')[2] == 2)) {
				e_o_token = input[2]
				set_token(me,'w','out',e_o_token)
				match_partner_token_to_me(me,'w','out')
				shade_horiz = true
			} else if ((input[1] == 'w') && (me.get_token('e','out')[2] == 2)) {
				w_o_token = input[2]
				set_token(me,'e','out',w_o_token)
				match_partner_token_to_me(me,'e','out')
				shade_horiz = true
			}
		})
		// it's a crossover glyph - clear incoming gates on a per-direction basis:
		if (n_o_token != 4) {
			set_token(this,'n','in',2)
			match_partner_token_to_me(this,'n','in')
		}
		if (e_o_token != 4) {
			set_token(this,'e','in',2)
			match_partner_token_to_me(this,'e','in')
		}
		if (s_o_token != 4) {
			set_token(this,'s','in',2)
			match_partner_token_to_me(this,'s','in')
		}
		if (w_o_token != 4) {
			set_token(this,'w','in',2)
			match_partner_token_to_me(this,'w','in')
		}
		//shade if *either* wire is used - this can result in double-shading
		if (shade_vert) {
			this.shade = this.shade - 3
		}
		if (shade_horiz) {
			this.shade = this.shade - 3
		}
	}
objects.push(crossover_glyph)

var nand_glyph = object_clone(box)
nand_glyph.x = 150
nand_glyph.outputs = []
nand_glyph.glyph = 'nand'
nand_glyph.glyph_logic = function() {
		var sum = 0
		this.inputs.each( function(input) {
			sum = sum + input[2]
		})
		var output_token, me = this
		if (sum < 2) output_token = 1
		else output_token = 0
		this.outputs.each(function(output) {
			output[2] = output_token
			// set the input token for the destination neighbor: 
			get_object(output[0]).inputs.each(function(input) {
				if (input[0] == me.obj_id) input[2] = output_token
			})
		})
		// clear out my inputs & corresponding neighbors' outputs:
		this.inputs.each( function(input) {
			input[2] = 2
		})
  }
objects.push(nand_glyph)

var delete_glyph = object_clone(box)
delete_glyph.x = 300
delete_glyph.outputs = []
delete_glyph.glyph = 'delete'
delete_glyph.glyph_logic = function() {
		var output_token, me = this
                if (this.inputs[1][2] == 0) {
                        output_token = this.inputs[0][2]
                } else if (this.inputs[1][2] == 1) {
                        output_token = 2
                }
		this.outputs.each(function(output) {
			output[2] = output_token
			// set the input token for the destination neighbor: 
			get_object(output[0]).inputs.each(function(input) {
				if (input[0] == me.obj_id) input[2] = output_token
			})
		})
		// clear out my inputs & corresponding neighbors' outputs:
		this.inputs.each( function(input) {
			input[2] = 2
		})
  }
objects.push(delete_glyph)

var copy_glyph = object_clone(box)
copy_glyph.x = 350
copy_glyph.outputs = []
copy_glyph.glyph = 'copy'
copy_glyph.glyph_logic = function() {
		var output_token, me = this
                if (this.inputs[1][2] == 0) {
                        output_token = this.inputs[0][2]
                } else if (this.inputs[1][2] == 1) {
                        output_token = 2
                }
		this.outputs.each(function(output) {
			output[2] = output_token
			// set the input token for the destination neighbor: 
			get_object(output[0]).inputs.each(function(input) {
				if (input[0] == me.obj_id) input[2] = output_token
			})
		})
		// clear out my inputs & corresponding neighbors' outputs:
		this.inputs.each( function(input) {
			input[2] = 2
		})
  }
objects.push(copy_glyph)

load_next_script()
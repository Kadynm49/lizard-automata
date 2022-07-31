// template code borrowed from https://editor.p5js.org/Rito/sketches/BJ5D_KeTg
// tattoo deciding seed should be "Kadyn Zachary James Marshall"

// maybe could use seeded rand function to decide color of next hexagon, and brute force generate
// hexagons this way until we get a hexagon that is valid

var hex_size = 30;
var map_radius = 3;
var origin;
var padding = 0;
var intersections = [];
var seed = "";
var grid_type = "HEXAGON";
var colors = [ [17, 191, 48], [0, 0, 0] ]; //17, 101, 48
var grid = {}

function generate() {
  seed = document.getElementById("seed").value;
  var rand = get_random_number_generator(seed);
  //find_all_valid_patterns();
  fill_grid(grid_type, rand);
}

function makeArray(w, h, val) {
  var arr = [];
  for(let i = 0; i < h; i++) {
    arr[i] = [];
      for(let j = 0; j < w; j++) {
        arr[i][j] = val;
      }
    }
    return arr;
  }

function setup() {
  document.getElementById("go").onclick = generate;
  document.getElementById("seed").value = Date.now();
  createCanvas(1000, 1000);
  angleMode(RADIANS);
  frameRate(15);
  origin = createVector(width / 2, height / 2);
}

function draw() {
  background(180,132,96);
	stroke(255);
	strokeWeight(1);

	//translate(300, 300);
	if(grid_type == "HEXAGON"){
		for (var q = -map_radius; q <= map_radius; q++) {
				var r1 = max(-map_radius, -q - map_radius);
				var r2 = min(map_radius, -q + map_radius);
				for (var r = r1; r <= r2; r++) {
					draw_hexagon(hex_to_pixel(q, r), hex_size, q, r);
				}
		}
	}
	// strokeWeight(8);
	// stroke(255, 180);
	// for(var i = 0; i < intersections.length; i++){
	// 	point(intersections[i].x, intersections[i].y);
	// }
	intersections = [];
}

function fill_grid(grid_type, rand) {
  if (grid_type == "HEXAGON") {
    fill_grid_hexagon(rand);
  } else if (grid_type == "TRIANGLE") {
    fill_grid_triangle(rand);
  } else if (grid_type == "PARALLELOGRAM") {
    fill_grid_parallelogram(rand);
  } else if (grid_type == "RECTANGLE") {
    fill_grid_rectangle(rand);
  }
}

// fills the map with 0's and 1's in the shape of a hexagon using map_radius
// make sure it's a valid pattern
function fill_grid_hexagon(rand) {
  // fill randomly
  for (var q = -map_radius; q <= map_radius; q++) {
    var r1 = max(-map_radius, -q - map_radius);
    var r2 = min(map_radius, -q + map_radius);
    for (var r = r1; r <= r2; r++) {
      grid["" + q + r + (-q - r)] = rand(0, 2);
    }
  }

  setTimeout(() => { // for debugging
    var valid_pattern = is_valid_pattern();
    var invalid_count = 0;

    // if it's not valid, flip nodes until it is
    while (!valid_pattern) {
      if (++invalid_count % 10000 == 0) {
        console.log("invalid count: " + invalid_count);
      }
      for (var q = -map_radius; q <= map_radius; q++) {
        var r1 = max(-map_radius, -q - map_radius);
        var r2 = min(map_radius, -q + map_radius);
        for (var r = r1; r <= r2; r++) {
          if (rand(0, 2) == 0) {
            if (!is_valid_node(q, r)) {
              flip_neighbors_if_necessary(q, r, rand)
            }
          }
        }
      }
      valid_pattern = is_valid_pattern(grid);
    }
  }, 10);

}

function flip_neighbors_if_necessary(q, r, rand) {
  var neighbors = get_green_and_black_neighbors(q, r);
  var green_neighbors = neighbors[0];
  var black_neighbors = neighbors[1];

  // if it's a black node and it has less than 3 green neighbors
  // flip black neighbors green until there are 3 green neighbors
  if (grid["" + q + r + (-q - r)] == 1 && green_neighbors.length < 3) {
    var num_flips = 3 - green_neighbors.length;
    for (var i = 0; i <num_flips; i++) {
      var rand_index = rand(0, black_neighbors.length);
      var black_neighbor = black_neighbors[rand_index];
      black_neighbors.splice(rand_index, 1);
      var black_neighbor_q = black_neighbor[0];
      var black_neighbor_r = black_neighbor[1];
      grid["" + black_neighbor_q + black_neighbor_r + (-black_neighbor_q - black_neighbor_r)] = 0;
    }
  }
  // if it's a black node and it has more than 3 green neighbors
  // flip green neighbors until there are only 3 green neighbors
  else if(grid["" + q + r + (-q - r)] == 1 && green_neighbors.length > 3) {
    var num_flips = green_neighbors.length - 3;
    for (var i = 0; i < num_flips; i++) {
      var rand_index = rand(0, green_neighbors.length);
      var green_neighbor = green_neighbors[rand_index];
      green_neighbors.splice(rand_index, 1);
      var green_neighbor_q = green_neighbor[0];
      var green_neighbor_r = green_neighbor[1];
      grid["" + green_neighbor_q + green_neighbor_r + (-green_neighbor_q - green_neighbor_r)] = 1;
    }
  }
  // if it's a green node and it has less than 4 black neighbors
  // flip green neighbors until there are 4 black neighbors
  else if (grid["" + q + r + (-q - r)] == 0 && black_neighbors.length < 4) {
    var num_flips = 4 - black_neighbors.length;
    for (var i = 0; i < num_flips; i++) {
      var rand_index = rand(0, green_neighbors.length);
      var green_neighbor = green_neighbors[rand_index];
      green_neighbors.splice(rand_index, 1);
      var green_neighbor_q = green_neighbor[0];
      var green_neighbor_r = green_neighbor[1];
      grid["" + green_neighbor_q + green_neighbor_r + (-green_neighbor_q - green_neighbor_r)] = 1;
    }
  }
  // if it's a green node and it has more than 4 black neighbors
  // flip black neighbors until there are only 4 black neighbors
  else if (grid["" + q + r + (-q - r)] == 0 && black_neighbors.length > 4) {
    var num_flips = black_neighbors.length - 4;
    for (var i = 0; i <num_flips; i++) {
      var rand_index = rand(0, black_neighbors.length);
      var black_neighbor = black_neighbors[rand_index];
      black_neighbors.splice(rand_index, 1);
      var black_neighbor_q = black_neighbor[0];
      var black_neighbor_r = black_neighbor[1];
      grid["" + black_neighbor_q + black_neighbor_r + (-black_neighbor_q - black_neighbor_r)] = 0;
    }
  }
}

function get_green_and_black_neighbors(q, r) {
  var green_neighbors = [];
  var black_neighbors = [];

  var neighbors = get_neighbors_coordinates(q, r);

  if (grid["" + neighbors[0][0] + neighbors[0][1] + (-neighbors[0][0] - neighbors[0][1])] !== undefined) {
    if (grid["" + neighbors[0][0] + neighbors[0][1] + (-neighbors[0][0] - neighbors[0][1])] == 0) {
      green_neighbors.push([neighbors[0][0], neighbors[0][1]]);
    } else {
      black_neighbors.push([neighbors[0][0], neighbors[0][1]]);
    }
  }
  if (grid["" + neighbors[1][0] + neighbors[1][1] + (-neighbors[1][0] - neighbors[1][1])] !== undefined) {
    if (grid["" + neighbors[1][0] + neighbors[1][1] + (-neighbors[1][0] - neighbors[1][1])] == 0) {
      green_neighbors.push([neighbors[1][0], neighbors[1][1]]);
    } else {
      black_neighbors.push([neighbors[1][0], neighbors[1][1]]);
    }
  }
  if (grid["" + neighbors[2][0] + neighbors[2][1] + (-neighbors[2][0] - neighbors[2][1])] !== undefined) {
    if (grid["" + neighbors[2][0] + neighbors[2][1] + (-neighbors[2][0] - neighbors[2][1])] == 0) {
      green_neighbors.push([neighbors[2][0], neighbors[2][1]]);
    } else {
      black_neighbors.push([neighbors[2][0], neighbors[2][1]]);
    }
  }
  if (grid["" + neighbors[3][0] + neighbors[3][1] + (-neighbors[3][0] - neighbors[3][1])] !== undefined) {
    if (grid["" + neighbors[3][0] + neighbors[3][1] + (-neighbors[3][0] - neighbors[3][1])] == 0) {
      green_neighbors.push([neighbors[3][0], neighbors[3][1]]);
    } else {
      black_neighbors.push([neighbors[3][0], neighbors[3][1]]);
    }
  }
  if (grid["" + neighbors[4][0] + neighbors[4][1] + (-neighbors[4][0] - neighbors[4][1])] !== undefined) {
    if (grid["" + neighbors[4][0] + neighbors[4][1] + (-neighbors[4][0] - neighbors[4][1])] == 0) {
      green_neighbors.push([neighbors[4][0], neighbors[4][1]]);
    } else {
      black_neighbors.push([neighbors[4][0], neighbors[4][1]]);
    }
  }
  if (grid["" + neighbors[5][0] + neighbors[5][1] + (-neighbors[5][0] - neighbors[5][1])] !== undefined) {
    if (grid["" + neighbors[5][0] + neighbors[5][1] + (-neighbors[5][0] - neighbors[5][1])] == 0) {
      green_neighbors.push([neighbors[5][0], neighbors[5][1]]);
    } else {
      black_neighbors.push([neighbors[5][0], neighbors[5][1]]);
    }
  }

  return [green_neighbors, black_neighbors];
}

function get_neighbors_coordinates(q, r) {
  return [[q + 1, r - 1], [q + 1, r], [q, r + 1], [q - 1, r + 1], [q - 1, r], [q, r - 1]];
}

// Make sure that each grid with a value of 0 (green) has 4 neighbors with a value of 1 (black)
// and each grid with a value of 1 (black) has 3 neighbors with a value of 0 (green)/
// Ignore the edges of the grid
function is_valid_pattern() {
  for (var q = -map_radius; q <= map_radius; q++) {
    var r1 = max(-map_radius, -q - map_radius);
    var r2 = min(map_radius, -q + map_radius);
    for (var r = r1; r <= r2; r++) {
      if (!is_valid_node(q, r)) {
        return false;
      }
    }
  }
  return true;
}

function is_valid_node(q, r) {
  if (!is_edge_node(q, r)) {
    var neighbors = get_green_and_black_neighbors(q, r);
    var green_neighbors = neighbors[0];
    var black_neighbors = neighbors[1];
    if (grid["" + q + r + (-q - r)] == 1) {
      if (green_neighbors.length != 3) {
        return false;
      }
    } else {
      if (black_neighbors.length != 4) {
        return false;
      }
    }
  }
  return true;
}

function is_edge_node(q, r) {
  return (q == -map_radius || q == map_radius || r == -map_radius || r == map_radius || (-q - r) == map_radius || (-q - r) == -map_radius);
}

// function find_all_valid_patterns() {

// }

function pixel_to_hex(x, y) {
  q = ((x * sqrt(3)) / 3 - y / 3) / hex_size;
  r = (-x / 3 + (sqrt(3) / 3) * y) / hex_size;
  return createVector(round(q), round(r));
}

function hex_to_pixel(q, r) {
  // This is basically a matrix multiplication between a hexagon orientation matrix
  // and the vector {q; r}
  var x = (sqrt(3) * q + (sqrt(3) / 2) * r) * hex_size;
  var y = (0 * q + (3 / 2) * r) * hex_size;
  return createVector(x + origin.x, y + origin.y);
}

function draw_hexagon(center, size, q, r, drawCities = true) {
  points = [];
	for(var i = 0; i < 6; i++){
		points.push(hex_corner(center, size - padding, i));
		var c = hex_corner(center, size, i);
		if(intersections_includes(c) == false && drawCities)
			intersections.push(c);
	}

	// beginShape();
	// for(i = 1; i <= 6; i++){
    if (grid["" + q + r + (-q - r)] !== undefined) {
      fill(colors[grid["" + q + r + (-q - r)]]);
      stroke(colors[grid["" + q + r + (-q - r)]]);
    } else {
      fill(0,200,0);
      stroke(0,200,0);
    }
    circle(center.x, center.y, size + (size / 2.5));
		// point(points[i % 6].x, points[i % 6].y);
		// vertex(points[i % 6].x, points[i % 6].y);
		// line(points[i-1].x, points[i-1].y, points[i % 6].x, points[i % 6].y);
	// }
	// endShape();

	// fill(255);
	// textSize(10);
	// textAlign(CENTER, CENTER);
	// text(q + " " + r + " \n" + (-q-r), center.x + 1, center.y + 2)
}

function intersections_includes(c){
	for(var i = 0; i < intersections.length; i++){
		if(approx(intersections[i].x,c.x) && approx(intersections[i].y, c.y)){
			return true;
		}
	}
	return false;
}

epsilon = padding + 1;

function approx(a,b){
	if(abs(a - b) < epsilon)
		return true;
	return false;
}

function hex_corner(center, size, i){
    var angle_deg = 60 * i   + 30
    var angle_rad = PI/180 * angle_deg;
    return createVector(center.x + size * cos(angle_rad),
                 center.y + size * sin(angle_rad));
}

function get_random_number_generator(seed) {
  var hash_seed = cyrb128(seed);
  return sfc32(hash_seed[0], hash_seed[1], hash_seed[2], hash_seed[3]);
}
function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

// returns a function that will include the MIN value and exclude the MAX value.
function sfc32(a, b, c, d) {
  return function(min, max) {
    let difference = max - min;

    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    var rand = (t >>> 0) / 4294967296;
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
  }
}

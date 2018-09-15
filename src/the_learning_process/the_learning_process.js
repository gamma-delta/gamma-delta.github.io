let TILE_PX_SIZE = 48;
let FPS = (1 / 30) * 1000; //30 fps
let ERROR_COOLDOWN_TIME = 60; //60 frames, 2 seconds

document.getElementById("passcode_end").style.display = "none";
document.getElementById("game").style.display = "none";
document.getElementById("bside_site").style.display = "none";
document.getElementById("win").style.display = "none";

function startGame(side) {
	console.log("Starting side: "+side);
	window.addEventListener("keydown", function(event){ player.move(event); }, false);
	document.getElementById("passcode_start").style.display = "none";
	document.getElementById("passcode_end").style.display = "block";
	document.getElementById("game").style.display = "block";
	
	gameArea.start();
	player.side = side;
	if (player.side === "a") {
		loadPuzzle(puzzle_00a);
	} else {
		loadPuzzle(puzzle_00b);
		document.getElementById("aside_page").style.display = "none";
		document.getElementById("bside_site").style.display = "inline";
	}
	
}

var gameArea = {
	canvas: document.getElementById("canvas"),
	start: function() {
		this.context = this.canvas.getContext("2d");
		this.interval = setInterval(updateGameArea, FPS);
	},
	clear: function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

var player = {
	x: 0,
	y: 0,
	tilesWalked: [],
	side: "a",
	timer: 0,
	frame: 0,
	texture: new Image(),
	update: function() {
		this.timer++;
		if (this.timer % 10 === 0) { //every 10 frames, or 1/3 seconds
			this.timer = 0;
			this.frame++;
			if (this.frame % 8 === 0) { //there are 8 frames
				this.frame = 0;
			}
			//ANIMATION CODE HERE
		}
		ctx = gameArea.context;
		ctx.drawImage(this.texture, this.x * TILE_PX_SIZE, this.y * TILE_PX_SIZE);
	},
	move: function(event) {
		var _didWalk = false;
		switch(event.keyCode) {
		case 37: case 65: //left
			if (getWalkableAtPosition(this.x - 1, this.y)) {
				this.x--;
				_didWalk = true;
			}
			break;
		case 38: case 87: //up
			if (getWalkableAtPosition(this.x, this.y - 1)) {
				this.y--;
				_didWalk = true;
			}
			break;
		case 39: case 68: //right
			if (getWalkableAtPosition(this.x + 1, this.y)) {
				this.x++;
				_didWalk = true;
			}
			break;
		case 40: case 83: //down
			if (getWalkableAtPosition(this.x, this.y + 1)) {
				this.y++;
				_didWalk = true;
			}
			break;
		case 82: //reset
		advancePuzzle(false);
		break;
		}
		if (_didWalk) {
			getTileAtPosition(this.x, this.y).walked--; //walking on this tile
			this.tilesWalked.push(getTileAtPosition(this.x, this.y));
			if (getTileAtPosition(this.x, this.y).type === "e") { //advance the level
				advancePuzzle();
			}
		}
	}
};
player.texture.src = "textures/player.png";

function Tile(x, y, type) {
	this.x = x;
	this.y = y;
	this.type = type;
	this.walkedMax = 1;
	this.walked = this.walkedMax;
	this.hasError = false;
	this.errorCooldown = 0;
	
	this.texture = new Image();
	this.texturePath = "";
	switch(this.type) { //do textures
	default:
	case ".":
		this.texturePath = "blank";
		break;
	case "#":
		this.texturePath = "floor";
		break;
	case "s":
		this.texturePath = "start";
		break;
	case "e":
		this.texturePath = "end";
		break;
	case "{":
		this.texturePath = "sequence_b";
		break;
	case "}":
		this.texturePath = "sequence_w";
		break;
	case "^":
		this.texturePath = "arrow_up";
		break;
	case ">":
		this.texturePath = "arrow_right";
		break;
	case "<":
		this.texturePath = "arrow_left";
		break;
	case "V":
		this.texturePath = "arrow_down";
		break;
	}
	
	this.update = function() {
		if (this.walked === 0) {
			this.texture.src = "textures/" + this.texturePath + "-w.png"; //walked texture
		} else if (this.errorCooldown > 0) {
			this.errorCooldown--;
			if (this.errorCooldown === 0) { this.hasError = false; }
			this.texture.src = "textures/"  +this.texturePath + "-e.png"; //error texture
		} else {
			this.texture.src = "textures/" + this.texturePath + ".png"; //plain texture
		}
		ctx = gameArea.context;
		ctx.drawImage(this.texture, this.x * TILE_PX_SIZE, this.y * TILE_PX_SIZE);
		if (!this.hasError) { this.errorCooldown = 0; }
	}
}

function getTileAtPosition(posX, posY) {
	for (var i in current_puzzle.tiles) {
		if (current_puzzle.tiles[i].x === posX && current_puzzle.tiles[i].y === posY) {
			if (current_puzzle.tiles[i].type !== ".") { //if its not blank space
				return current_puzzle.tiles[i];
			}
		}
	}
	return false;
}

function getWalkableAtPosition(posX, posY) {
	var _tile = getTileAtPosition(posX, posY);
	if (_tile !== false) {
		if (_tile.walked > 0 && _tile.type !== ".") {
			return true;
		}
	}
	return false;
}

function Puzzle(lines) {
	var _length = lines[0].length; //the width of the puzzle
	var validInput = true;
	for (var i = 1; i < lines.length; i++) {
		if (lines[i].length !== _length) { //if there is a difference in the length
			validInput = false;
			break;
		}
	}
	
	this.lines = lines;
	this.tiles = [];
	
	if(validInput) {
		this.x = lines[0].length; //horiz
		this.y = lines.length; //vert
		for (var i = 0; i < lines.length; i++) { //iterate over each string
			for (var j = 0; j < lines[i].length; j++) {//iterate over each character
				this.tiles.push(new Tile(j, i, lines[i][j])); //add a new tile to that spot
			}
		}
	} else { //emergency!! something went wrong
		this.x = 1;
		this.y = 1;
		this.tiles = [
			new Tile(0, 0, "#") //just a wall
		];
	}
	
	this.sequenceTileCount = 0;
	this.arrowTileCount = 0;
	for(var i in this.tiles) {
		if(this.tiles[i].type === "s") {
			this.playerX = this.tiles[i].x;
			this.playerY = this.tiles[i].y;
		} else if (this.tiles[i].type === "{" || this.tiles[i].type === "}") {
			this.sequenceTileCount++;
		} else if (this.tiles[i].type === "^" || this.tiles[i].type === "<" || this.tiles[i].type === ">" || this.tiles[i].type === "V") {
			this.arrowTileCount++;
		}
	}
	
	this.nextPuzzle = null;
}

/*
Puzzle and tile codes
. = empty space
# = floor
s = start
e = end
{ , } = sequence tiles: 
	A: Collect all {, then } or vice versa
	B: Collect {, then }
^, <, >, V = arrow tiles:
	A: You must walk straight through every one of them
	B: You must exit on that side.
*/

//Asides
//intro
var puzzle_00a = new Puzzle([ //movemement
".....",
"s###e",
"....."
]);
var puzzle_01a = new Puzzle([ //you don't have to collect all the tiles
"s####",
"..#..",
"..e.."
]);
var puzzle_02a = new Puzzle([//no turning back
"s####",
"..#.#",
"#####",
"#....",
"####e"
]);
//sequence blocks
var puzzle_03a = new Puzzle([//collect the sequence tiles
".....",
"s#{#e",
"....."
]);
var puzzle_04a = new Puzzle([//collect all tiles
".#{#.",
"s###e",
".#{#."
]);
var puzzle_05a = new Puzzle([//two colors, (order)
".###.",
"s{#}e",
".###."
]);
var puzzle_06a = new Puzzle([//different numbers, any first
"#{#{#",
"s###e",
"##}##"
]);
var puzzle_07a = new Puzzle([//all of one color first
"#}#}#",
"s###e",
"#{#{#"
]);
var puzzle_08a = new Puzzle([//iterate
".}#}.",
"s###e",
"###{#"
]);
var puzzle_09a = new Puzzle([//iterate
"s{###",
"}#}##",
"###}e"
]);
var puzzle_10a = new Puzzle([ //and, one final mastery challenge
"}##{##{",
"##{e{##",
"####}##",
"{#}##}#",
"s{#####"
]);
// arrow tiles
var puzzle_11a = new Puzzle([ //ooh, a new tile!
"..e..",
"..#..",
"..^..",
"..#..",
"..s.."
]);
var puzzle_12a = new Puzzle([ //ooh, different directions
".###.",
"s#>#e",
".###."
]);
var puzzle_13a = new Puzzle([ //in front, out back!
".###.",
"s#V#e",
".###."
]);
var puzzle_14a = new Puzzle([ //all 4 directions, collect every single one, in front, out back
"##<#s",
"#####",
"##V##",
"#####",
"e####",
]);
var puzzle_15a = new Puzzle([ //a little fun
"s#<##",
"V####",
"#Ve^#",
"####^",
"##>##"
]);
var puzzle_16a = new Puzzle([ //working with both sets of tiles now
"{###e",
"##V##",
"s###}"
]);
var puzzle_17a = new Puzzle([ //symmetry
"{###e",
"#{V}#",
"s###}"
]);

var puzzle_wina = new Puzzle([
"#...#.#####.#...#",
".#.#..#...#.#...#",
"..#...#...#.#...#",
"..#...#...#.#...#",
"..#...#####.#####",
".................",
"s###############e",
".................",
"#...#.#####.#...#",
"#...#...#...##..#",
"#.#.#...#...#.#.#",
"#.#.#...#...#..##",
"#####.#####.#...#"
]);

var puzzle_b0a = new Puzzle([ //bonus 0a
"s",
"e"
]);

puzzle_00a.nextPuzzle = puzzle_01a; //intro
puzzle_01a.nextPuzzle = puzzle_02a;
puzzle_02a.nextPuzzle = puzzle_03a;
puzzle_03a.nextPuzzle = puzzle_04a; //sequence
puzzle_04a.nextPuzzle = puzzle_05a;
puzzle_05a.nextPuzzle = puzzle_06a;
puzzle_06a.nextPuzzle = puzzle_07a;
puzzle_07a.nextPuzzle = puzzle_08a;
puzzle_08a.nextPuzzle = puzzle_09a;
puzzle_09a.nextPuzzle = puzzle_10a;
puzzle_10a.nextPuzzle = puzzle_11a;
puzzle_11a.nextPuzzle = puzzle_12a; //arrow
puzzle_12a.nextPuzzle = puzzle_13a;
puzzle_13a.nextPuzzle = puzzle_14a;
puzzle_14a.nextPuzzle = puzzle_15a;
puzzle_15a.nextPuzzle = puzzle_16a;
puzzle_16a.nextPuzzle = puzzle_17a;
puzzle_17a.nextPuzzle = puzzle_wina;

puzzle_wina.nextPuzzle = puzzle_b0a;

//Bsides

var puzzle_00b = new Puzzle([ //movement
".....",
"s###e",
"....."
]);
var puzzle_01b = new Puzzle([ //don't collect every tile
"s####",
"..#..",
"..e.."
]);
var puzzle_02b = new Puzzle([ //no turning back(?)
"s####",
"..#.#",
"#####",
"#....",
"####e"
]);
//sequence blocks
var puzzle_03b = new Puzzle([ //collect black
".....",
"s#{#e",
"....."
]);
var puzzle_04b = new Puzzle([ //collect black & white
".....",
"s{#}e",
"....."
]);
var puzzle_05b = new Puzzle([ //collect black -> white
"##{##",
"s###e",
"##}##"
]);
var puzzle_06b = new Puzzle([ //collect black -> white!
"##}##",
"s###e",
"##{##"
]);
var puzzle_07b = new Puzzle([ //really drill this in your skull
"###{#",
"s###e",
"#}###"
]);
var puzzle_08b = new Puzzle([ //different numbers
"##{##",
"s###e",
".}#}."
]);
var puzzle_09b = new Puzzle([ //more black -> white
"s{##{",
"}####",
"##}#e"
]);
var puzzle_10b = new Puzzle([ //a test of skill
"s}###",
"#####",
"#{e##",
"##}##",
"{###}"
]);
var puzzle_11b = new Puzzle([ //ooh, a new tile type!
".....",
"s#>#e",
"....."
]);

var puzzle_12b = new Puzzle([ //you can enter from whatever side
"e#<..",
"..#..",
"..^#s"
]);

var puzzle_13b = new Puzzle([ //a small space to experiment in
"s##>e",
"V####",
">####",
"..V##",
"..###"
]);

var puzzle_winb = new Puzzle([
"#...#.#####.#...#",
".#.#..#...#.#...#",
"..#...#...#.#...#",
"..#...#...#.#...#",
"..#...#####.#####",
".................",
"s###############e",
".................",
"#...#.#####.#...#",
"#...#...#...##..#",
"#.#.#...#...#.#.#",
"#.#.#...#...#..##",
"#####.#####.#...#"
]);
var puzzle_b0b = new Puzzle([
"s",
"e"
]);

puzzle_00b.nextPuzzle = puzzle_01b; //intro
puzzle_01b.nextPuzzle = puzzle_02b;
puzzle_02b.nextPuzzle = puzzle_03b;
puzzle_03b.nextPuzzle = puzzle_04b; //sequence
puzzle_04b.nextPuzzle = puzzle_05b;
puzzle_05b.nextPuzzle = puzzle_06b;
puzzle_06b.nextPuzzle = puzzle_07b;
puzzle_07b.nextPuzzle = puzzle_08b;
puzzle_08b.nextPuzzle = puzzle_09b;
puzzle_09b.nextPuzzle = puzzle_10b;
puzzle_10b.nextPuzzle = puzzle_11b; //arrow
puzzle_11b.nextPuzzle = puzzle_12b;
puzzle_12b.nextPuzzle = puzzle_13b;
puzzle_13b.nextPuzzle = puzzle_winb;

puzzle_winb.nextPuzzle = puzzle_b0b;

var current_puzzle;

function loadPuzzle(puzzle) {
	current_puzzle = puzzle;
	gameArea.canvas.width = current_puzzle.x * TILE_PX_SIZE;
	gameArea.canvas.height = current_puzzle.y * TILE_PX_SIZE;
	
	for (var i in current_puzzle.tiles) {
		current_puzzle.tiles[i].walked = current_puzzle.tiles[i].walkedMax;
	}
	
	player.x = current_puzzle.playerX;
	player.y = current_puzzle.playerY;
	getTileAtPosition(player.x, player.y).walked = 0;
	player.tilesWalked = [];
	player.tilesWalked.push(getTileAtPosition(player.x, player.y));
}

function advancePuzzle(checkErrors = true) {
	for (var i in current_puzzle.tiles) {
		current_puzzle.tiles[i].hasError = false;
	}
	if(!checkErrors) {
		var _fadeBlack = 1;
		var _fadeSwitch = true;
		var _ctx = gameArea.context;
		
		var _fadeInterval = setInterval(function() {
			if (_fadeSwitch) {
				_fadeBlack -= 0.3;
			} else {
				_fadeBlack += 0.3;
			}
			
			if (_fadeBlack <= 0) {
				_fadeSwitch = false;
				loadPuzzle(current_puzzle);
			}
			
			if (_fadeBlack >= 1 && !_fadeSwitch) {
				clearInterval(_fadeInterval);
			}
			document.getElementById("canvas").style.filter = "brightness(" + _fadeBlack + ")";
		}, FPS);
		return;
	}
	
	var _success = true;
	if (player.side === "a") {
		//puzzle check variables
		var _sequenceTilesCrossed = 0;
		var _arrowTilesCrossed = 0;
		
		var _sequenceSide = null;
		var _sequenceSideChanged = false;
		
		for (var i = 0; i < player.tilesWalked.length; i++) { //yes i have to do it the long way
			var _tile = player.tilesWalked[i];
			//sequence blocks
			if (_tile.type === "{" || _tile.type === "}") {
				_sequenceTilesCrossed++;
			}
			if (_tile.type === "{" && _sequenceSide === null) { //first black
				_sequenceSide = "black";
			} else if (_tile.type === "}" && _sequenceSide === null) { //first white
				_sequenceSide = "white";
			} else if ((_tile.type === "{" && _sequenceSide === "white") && !_sequenceSideChanged) { //if we've switched to black for the first time
				_sequenceSideChanged = true;
				_sequenceSide = "black";
			} else if ((_tile.type === "}" && _sequenceSide === "black") && !_sequenceSideChanged) { //switch to white for first time
				_sequenceSideChanged = true;
				_sequenceSide = "white";
			} else if ((_tile.type === "}" && _sequenceSide === "black" && _sequenceSideChanged) || 
			(_tile.type === "{") && _sequenceSide === "white" && _sequenceSideChanged) { //AAAAA puzzle failed
				_tile.hasError = true;
				_success = false;
			}
			
			//arrow blocks
			if (_tile.type === "^" || _tile.type === "<" || _tile.type === ">" || _tile.type === "V") {
				_arrowTilesCrossed++;
			}
			if (_tile.type === "^") {
				if ( _tile.y + 1 !== player.tilesWalked[i-1].y || _tile.y - 1 !== player.tilesWalked[i+1].y ) {
					//if the tile I just walked on isn't below this one or the tile I walked on afterward isn't above
					_tile.hasError = true;
					_success = false;
				}
			} else if (_tile.type === "<") {
				if ( _tile.x + 1 !== player.tilesWalked[i-1].x || _tile.x - 1 !== player.tilesWalked[i+1].x ) {
					_tile.hasError = true;
					_success = false;
				}
			} else if (_tile.type === ">") {
				if ( _tile.x - 1 !== player.tilesWalked[i-1].x || _tile.x + 1 !== player.tilesWalked[i+1].x ) {
					_tile.hasError = true;
					_success = false;
				}
			} else if (_tile.type === "V") {
				if ( _tile.y - 1 !== player.tilesWalked[i-1].y || _tile.y + 1 !== player.tilesWalked[i+1].y) {
					_tile.hasError = true;
					_success = false;
				}
			}
		}
		//test the things at the end of the puzzle

		//check if we've crossed all the sequence tiles
		if (_sequenceTilesCrossed !== current_puzzle.sequenceTileCount) {
			for (var i in current_puzzle.tiles) {
				if (!(player.tilesWalked.includes(current_puzzle.tiles[i])) && 
				(current_puzzle.tiles[i].type === "{" || current_puzzle.tiles[i].type === "}")) {
					current_puzzle.tiles[i].hasError = true;
				}
			}
			_success = false;
		}
		
		//check for every arrow tile
		if (_arrowTilesCrossed !== current_puzzle.arrowTileCount) {
			for (var i in current_puzzle.tiles) {
				if (!(player.tilesWalked.includes(current_puzzle.tiles[i])) && 
				(current_puzzle.tiles[i].type === "^" || current_puzzle.tiles[i].type === "<" ||
				current_puzzle.tiles[i].type === ">" || current_puzzle.tiles[i].type === "V")) {
					current_puzzle.tiles[i].hasError = true;
				}
			}
			_success = false;
		}
		
	} else { //check the b-side
		//check vars
		var _arrowTilesCrossed = 0;
		var _sequenceTilesCrossed = 0;
		
		var _sequenceSide = null;
		var _sequenceSideChanged = false;
		
		for (var i = 0; i < player.tilesWalked.length; i++) {
			var _tile = player.tilesWalked[i];
			
			//sequence tiles
			if (_tile.type === "{" || _tile.type === "}") {
				_sequenceTilesCrossed++;
			}
			if (_tile.type === "}" && _sequenceSide === null) { //going on white first?!
				for (var j in player.tilesWalked) { //all sequences are errors
					if (player.tilesWalked[j].type === "{" || player.tilesWalked[j].type === "}") {player.tilesWalked[j].hasError = true;}
				}
				_success = false;
			} else if (_tile.type === "{" && _sequenceSide === null) { //going on black first
				_sequenceSide = "black";
			} else if (_tile.type === "}" && _sequenceSide === "black" && !_sequenceSideChanged) { //switching to white for the first time
				_sequenceSide = "white";
				_sequenceSideChanged = true;
			} else if (_tile.type === "}" && _sequenceSide === "black" && _sequenceSideChanged) { //switching to white again??!
				_tile.hasError = true;
				_success = false;
			}
			
			//arrow tiles
			if (_tile.type === "^" || _tile.type === "<" || _tile.type === ">" || _tile.type === "V") {
				_arrowTilesCrossed++;
			}
			if (_tile.type === "^") {
				if (_tile.y - 1 !== player.tilesWalked[i+1].y) {
					//if the next tile I walked on isn't above this one
					_tile.hasError = true;
					_success = false;
				}
			} else if (_tile.type === "<") {
				if (_tile.x - 1 !== player.tilesWalked[i+1].x) {
					_tile.hasError = true;
					_success = false;
				}
			} else if (_tile.type === ">") {
				if (_tile.x + 1 !== player.tilesWalked[i+1].x) {
					_tile.hasError = true;
					_success = false;
				}
			} else if (_tile.type === "V") {
				if (_tile.y + 1 !== player.tilesWalked[i+1].y) {
					_tile.hasError = true;
					_success = false;
				}
			}
		}
		//check end-of-puzzle things
			
		//check if we've crossed all the sequence tiles
		if (_sequenceTilesCrossed !== current_puzzle.sequenceTileCount) {
			for (var i in current_puzzle.tiles) {
				if (!(player.tilesWalked.includes(current_puzzle.tiles[i])) && 
				(current_puzzle.tiles[i].type === "{" || current_puzzle.tiles[i].type === "}")) {
					current_puzzle.tiles[i].hasError = true;
				}
			}
			_success = false;
		}
		
		//check to cross every arrow tile
		if (_arrowTilesCrossed !== current_puzzle.arrowTileCount) {
			for (var i in current_puzzle.tiles) {
				if (!(player.tilesWalked.includes(current_puzzle.tiles[i])) && 
				(current_puzzle.tiles[i].type === "^" || current_puzzle.tiles[i].type === "<" ||
				current_puzzle.tiles[i].type === ">" || current_puzzle.tiles[i].type === "V")) {
					current_puzzle.tiles[i].hasError = true;
				}
			}
			_success = false;
		}
	}
	
	if(_success) {
		var _fadeBlack = 1;
		var _fadeSwitch = true;
		var _ctx = gameArea.context;
		
		var _fadeInterval = setInterval(function() {
			if (_fadeSwitch) {
				_fadeBlack -= 0.1;
			} else {
				_fadeBlack += 0.1;
			}
			
			if (_fadeBlack <= 0) {
				_fadeSwitch = false;
				loadPuzzle(current_puzzle.nextPuzzle);
				if (_.isEqual(current_puzzle, puzzle_wina) || _.isEqual(current_puzzle, puzzle_winb)) {
					//activate win text
					document.getElementById("win").style.display = "block";
					document.getElementById("controls").style.display = "none";
				}
			}
			
			if (_fadeBlack === 1 && !_fadeSwitch) {
				clearInterval(_fadeInterval);
			}
			document.getElementById("canvas").style.filter = "brightness(" + _fadeBlack + ")";
		}, FPS);
		
	} else {
		var _fadeBlack = 1;
		var _fadeSwitch = true;
		var _ctx = gameArea.context;
		
		var _fadeInterval = setInterval(function() {
			if (_fadeSwitch) {
				_fadeBlack -= 0.2;
			} else {
				_fadeBlack += 0.2;
			}
			
			if (_fadeBlack <= 0) {
				_fadeSwitch = false;
				loadPuzzle(current_puzzle);
				for (var i in current_puzzle.tiles) {
					if (current_puzzle.tiles[i].hasError) { current_puzzle.tiles[i].errorCooldown = ERROR_COOLDOWN_TIME; }
				}
			}
			
			if (_fadeBlack === 1 && !_fadeSwitch) {
				clearInterval(_fadeInterval);
			}
			document.getElementById("canvas").style.filter = "brightness(" + _fadeBlack + ")";
		}, FPS);
	}
}

var _authCooldown = 100;
function updateGameArea() {
	gameArea.clear();
	for (var i = 0; i < current_puzzle.tiles.length; i++) {
		current_puzzle.tiles[i].update();
	}
	player.update();
	if (_authCooldown > 0) {
		_authCooldown--;
	} else if (_authCooldown === 0) {
		document.getElementById("passcode").style.display = "none";
	}
}
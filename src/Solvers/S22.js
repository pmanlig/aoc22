// import React from 'react';
import Solver from './Solvers';
import { drawCircle, drawFilledRect, drawText, Renderer } from '../util';
// import { SearchState, PixelMap } from '../util';

const right = 0;
const down = 1;
const left = 2;
const up = 3;

const directions = {
	0: { x: 1, y: 0 },
	1: { x: 0, y: 1 },
	2: { x: -1, y: 0 },
	3: { x: 0, y: -1 }
}

const cubeSides = {
	1: [6, 2, 5, 4],
	2: [6, 3, 5, 1],
	3: [6, 4, 5, 2],
	4: [6, 1, 5, 3],
	5: [1, 2, 3, 4],
	6: [3, 2, 1, 4]
}

const styles = {
	' ': "#FFFFFF",
	'#': "#000000",
	'.': "#AFAFAF"
}

class Side {
	constructor(num, x, y, rotation) {
		this.num = num;
		this.x = x;
		this.y = y;
		this.rotation = rotation;
	}
}

class Cube {
	constructor(board) {
		this.dimension = Math.min(...board.map(l => l.filter(c => c !== ' ').length));
		this.sides = this.calculateSides(board, this.dimension);
	}

	extendSide(board, dimension, dx, dy, side, sides) {
		let { num, x, y, rotation } = side;
		if (sides.some(s => s.x === x && s.y === y)) { return sides; }

		sides.push(side);
		if (x - dimension > -1 && board[y][x - dimension] !== ' ') {
			let n = cubeSides[num][(left + rotation) % 4];
			let r = ((dx - 1) * dy * 3 + 16) % 4;
			sides = this.extendSide(board, dimension, dx - 1, dy, new Side(n, x - dimension, y, r), sides);
		}
		if (x + dimension < board[y].length && board[y][x + dimension] !== ' ') {
			let n = cubeSides[num][(right + rotation) % 4];
			let r = ((dx + 1) * dy * 1 + 16) % 4;
			sides = this.extendSide(board, dimension, dx + 1, dy, new Side(n, x + dimension, y, dy, r), sides);
		}
		if (y - dimension > -1 && x < board[y - dimension].length && board[y - dimension][x] !== ' ') {
			let n = cubeSides[num][(up + rotation) % 4];
			let r = (dx * (dy - 1) * 1 + 16) % 4;
			sides = this.extendSide(board, dimension, dx, dy - 1, new Side(n, x, y - dimension, r), sides);
		}
		if (y + dimension < board.length && x < board[y + dimension].length && board[y + dimension][x] !== ' ') {
			let n = cubeSides[num][(down + rotation) % 4];
			let r = (dx * (dy + 1) * 1 + 16) % 4;
			sides = this.extendSide(board, dimension, dx, dy + 1, new Side(n, x, y + dimension, r), sides);
		}
		return sides;
	}

	calculateSides(board, dimension) {
		let x = board[0].findIndex(c => c !== ' ');
		return this.extendSide(board, dimension, 0, 0, new Side(1, x, 0, 0), []);
	}

	findSide({ x, y }) {
		return this.sides.find(s => s.x <= x && x < s.x + this.dimension && s.y <= y && y < s.y + this.dimension);
	}

	rotate({ x, y }, n) {
		let o = (this.dimension - 1) / 2;
		x -= o;
		y -= o;
		while (n-- > 0) {
			let d = x;
			x = -y;
			y = d;
		}
		x += o;
		y += o;
		return { x: x, y: y }
	}
}

class Position {
	constructor(x, y, direction) {
		this.x = x;
		this.y = y;
		this.dir = direction;
		this.path = [{ x: this.x, y: this.y }];
	}

	password() {
		return 1000 * (this.y + 1) + 4 * (this.x + 1) + this.dir;
	}

	moveCube(board, cube) {
		let d = directions[this.dir];
		let n = { x: this.x, y: this.y };
		n.x += d.x;
		n.y += d.y;
		if (n.y < 0 || n.y >= board.length || n.x < 0 || n.x >= board[n.y].length || board[n.y][n.x] === ' ') {
			n.x = (n.x + cube.dimension) % cube.dimension;
			n.y = (n.y + cube.dimension) % cube.dimension;
			let side = cube.findSide(this);
			console.log(this, side, n);
			let rotation = (4 - side.rotation) % 4;
			this.dir = (this.dir + rotation) % 4;
			n = cube.rotate(n, rotation);
			console.log(n, rotation);
			let newSide = cube.sides.find(s => s.num === cubeSides[side.num][this.dir]);
			rotation = 0;
			if (side.num === 5) { rotation = 3 * (newSide.num - 1); }
			if (newSide.num === 5) { rotation = 3 * (side.num - 1); }
			if (side.num === 6) { rotation = newSide.num - 1; }
			if (newSide.num === 6) { rotation = side.num - 1; }
			this.dir = (this.dir + rotation) % 4;
			n = cube.rotate(n, rotation);
			console.log(n);
			n.x += newSide.x;
			n.y += newSide.y;
			console.log(newSide, n);
		}
		if (board[n.y][n.x] === '#') { return false; }
		this.x = n.x;
		this.y = n.y;
		this.path.push({ x: this.x, y: this.y });
		return true;
	}

	move(board, cube) {
		if (cube) { return this.moveCube(board, cube); }

		let d = directions[this.dir];
		let n = { x: this.x, y: this.y };
		do {
			do {
				n.y = (n.y + d.y + board.length) % board.length;
			} while (n.x >= board[n.y].length);
			n.x = (n.x + d.x + board[n.y].length) % board[n.y].length;
		} while (board[n.y][n.x] === ' ');
		if (board[n.y][n.x] === '#') { return false; }
		this.x = n.x;
		this.y = n.y;
		this.path.push({ x: this.x, y: this.y });
		return true;
	}

	turn(dir) {
		this.dir = (this.dir + (dir === 'R' ? 1 : 3)) % 4;
	}
}

class PathRenderer extends Renderer {
	constructor(board, position, cube, pixelSize) {
		super(styles, Math.max(...board.map(l => l.length)), board.length, pixelSize);
		this.position = position;
		this.cube = cube;
	}

	draw(ctx, data) {
		drawFilledRect(ctx, 0, 0, this.width * this.pixelSize, this.height * this.pixelSize, "#FFFFFF");
		super.draw(ctx, data);
		this.position.path.forEach(p => {
			this.drawPixel(ctx, p.x, p.y, "#7F0000");
		});
		drawCircle(ctx, this.position.x * this.pixelSize + this.pixelSize / 2, this.position.y * this.pixelSize + this.pixelSize / 2, 5, "#00FF00", 1);
		this.drawPixel(ctx, this.position.x, this.position.y, "#00FF00");
		this.cube.sides.forEach(s => {
			drawText(ctx, s.x * this.pixelSize, s.y * this.pixelSize, s.num.toString(), "#0000FF", "20px bold sans-serif");
		});
	}
}

export class S22 extends Solver {
	initialPosition(board) {
		let x = 0;
		while (board[0][x] !== '.') { x++; }
		return new Position(x, 0, right);
	}

	setup(input) {
		// input = "        ...#\n        .#..\n        #...\n        ....\n...#.......#\n........#...\n..#....#....\n..........#.\n        ...#....\n        .....#..\n        .#......\n        ......#.\n\n10R5L5R10L4R5L5";
		input = input.split('\n\n');
		this.board = input[0].split('\n').map(l => l.split(''));
		this.cube = new Cube(this.board);
		this.distances = input[1].split(/[RL]/).map(n => parseInt(n, 10)).reverse();
		this.turns = input[1].split(/\d+/).filter(c => c.match(/[RL]/)).reverse();
		this.position = this.initialPosition(this.board);
		this.cubePosition = this.initialPosition(this.board);
		let renderer = new PathRenderer(this.board, this.cubePosition, this.cube, 2);
		this.setState({ solution: `Working...`, bmp: this.board, renderer: renderer });
	}

	solve() {
		if (this.distances.length > 1998) {
			for (let i = 0; i < 1 && this.distances.length > 0; i++) {
				let dist = this.distances.pop();
				while (dist-- > 0) {
					this.position.move(this.board);
					this.cubePosition.move(this.board, this.cube);
				}
				if (this.turns.length > 0) {
					let t = this.turns.pop();
					this.position.turn(t);
					this.cubePosition.turn(t);
				}
			}
			this.setState({ bmp: this.board });
		} else {
			return { solution: `Password: ${this.position.password()}\nCube password: ${this.cubePosition.password()}`, bmp: this.board };
		}
	}

	// Too high: 141232
}
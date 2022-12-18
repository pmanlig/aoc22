import Solver from './Solvers';
import { Renderer } from '../util';

const displayHeight = 30;

class CaveRenderer extends Renderer {
	constructor() {
		const styles = {
			0: "#000000",
			1: "#FF0000",
			2: "#00AF00",
			3: "#0000FF",
			4: "#FFFF00",
			5: "#00FFFF",
			9: "#6f6f6f",
		}

		super(styles, 9, displayHeight, 10);
	}

	draw(ctx, data) {
		for (let y = 0; y < displayHeight && y < data.length; y++) {
			let dy = data.length - 1 - y;
			for (let x = 0; x < data[dy].length; x++) {
				let style = this.styles[data[dy][x]];
				this.drawPixel(ctx, x, y, style);
			}
		}
	}
}

export class S17 extends Solver {
	renderer = new CaveRenderer();
	cave = [[9, 9, 9, 9, 9, 9, 9, 9, 9]];

	addEmpty() {
		this.cave.push([9, 0, 0, 0, 0, 0, 0, 0, 9]);
	}

	collision(shape, shapePos) {
		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape[y].length; x++) {
				if (shape[y][x] * this.cave[shapePos.y + y][shapePos.x + x] > 0) { return true; }
			}
		}
		return false;
	}

	placeShape(shape, shapePos) {
		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape[y].length; x++) {
				this.cave[shapePos.y + y][shapePos.x + x] += shape[y][x];
			}
		}
	}

	adjustTop(shape, shapePos) {
		this.top = Math.max(shapePos.y + shape.length - 1, this.top);
		while (this.cave.length < this.top + 8) { this.addEmpty(); }
	}

	findPeriod() {
		let log = this.log;
		for (let i = 0; i < log.length; i++) {
			for (let j = i + 1; j < log.length; j++) {
				if (log[i].shape === log[j].shape && log[i].input === log[j].input) {
					return { from: i, to: j }
				}
			}
		}
		return null;
	}

	dropRock() {
		const shapes = [
			[[1, 1, 1, 1]],
			[[0, 2, 0], [2, 2, 2], [0, 2, 0]],
			[[3, 3, 3], [0, 0, 3], [0, 0, 3]],
			[[4], [4], [4], [4]],
			[[5, 5], [5, 5]]
		];

		let shapePos = { x: 3, y: this.top + 4 }
		let shape = shapes[this.shape % 5];
		while (!this.collision(shape, shapePos)) {
			let move = this.input[this.pos++] === '<' ? -1 : 1;
			this.pos = this.pos % this.input.length;
			shapePos.x += move;
			if (this.collision(shape, shapePos)) { shapePos.x -= move; }
			shapePos.y--;
		}
		shapePos.y++;
		this.placeShape(shape, shapePos);
		this.adjustTop(shape, shapePos);
		this.shape++;
		this.addLog();
	}

	addLog() {
		if (this.period !== null) { return; }
		if (!this.log[this.pos]) { this.log[this.pos] = []; }
		if (!this.log[this.pos][this.shape % 5]) {
			this.log[this.pos][this.shape % 5] = [{ count: this.shape, top: this.top }];
		} else {
			this.log[this.pos][this.shape % 5].push({ count: this.shape, top: this.top });
		}
		let rep = this.log[this.pos][this.shape % 5];
		for (let to = rep.length - 1; to > 1; to--) {
			for (let from = to - 1; from >= (to - from); from--) {
				if (rep[to].count - rep[from].count === rep[from].count - rep[2 * from - to].count) {
					this.period = { a: rep[2 * from - to], from: rep[from], to: rep[to] }
				}
			}
		}
	}

	findExtendedTop() {
		while (!this.period && this.shape < 20000) { this.dropRock(); }
		let p = this.period.to.count - this.period.from.count;
		let d = this.period.to.top - this.period.from.top;
		let e = 1000000000000 - this.period.to.count;
		let i = Math.floor(e / p);
		let frac = e - (i * p);
		while (frac-- > 0) { this.dropRock(); }
		return this.top + i * d;
}

	setup(input) {
		// input = ">>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>";
		this.input = input;
		this.pos = 0;
		this.top = 0;
		this.shape = 0;
		this.log = [];
		this.period = null;
		while (this.cave.length < displayHeight) { this.addEmpty(); }
		this.setState({ bmp: this.cave, renderer: this.renderer });
	}

	solve() {
		const num_shapes = 2022;
		for (let i = 0; i < 20 && this.shape < num_shapes; i++) { this.dropRock(); }
		this.setState({ bmp: this.cave, renderer: this.renderer })
		if (this.shape === num_shapes) {
			let top = this.top;
			let extend = this.findExtendedTop();
			return {
				solution: `Top of tower: ${top}\n\
					Input length: ${this.input.length}\n\
					Period: (${this.period.from.count} - ${this.period.to.count})\n\
					Extended top of tower: ${extend}`
			};
		}
	}
}
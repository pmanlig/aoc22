// import React from 'react';
import { drawFilledRect, Renderer } from '../util';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

class ElfRenderer extends Renderer {
	constructor(width, height, pixelSize, offset) {
		super(null, width, height, pixelSize);
		this.offset = offset;
	}

	draw(ctx, data) {
		drawFilledRect(ctx, 0, 0, this.width * this.pixelSize, this.height * this.pixelSize, "#CFCFCF");
		data.forEach(e => {
			this.drawPixel(ctx, e.x + this.offset.x, e.y + this.offset.y, "#00AF00");
		});
	}
}

const directions = [
	{ check: [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }], move: { x: 0, y: -1 } }, // North
	{ check: [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }], move: { x: 0, y: 1 } }, // South
	{ check: [{ x: -1, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 }], move: { x: -1, y: 0 } }, // West
	{ check: [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 1, y: -1 }], move: { x: 1, y: 0 } }, // East
];

class Elf {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	close(e) {
		return Math.abs(this.x - e.x) < 2 && Math.abs(this.y - e.y) < 2;
	}

	calculate(elves, round) {
		const test = (d, e) => {
			return e.x === this.x + d.x && e.y === this.y + d.y;
		}

		this.propose = null;
		if (!elves.some(e => e !== this & this.close(e))) { return; } // remain in place
		for (let i = 0; i < 4; i++) {
			let dir = directions[(i + round) % 4];
			if (!dir.check.some(d => elves.some(e => test(d, e)))) {
				this.propose = { x: this.x + dir.move.x, y: this.y + dir.move.y }
				return;
			}
		}
	}

	move(elves) {
		if (this.propose === null) { return; }

		const test = (e) => {
			return e !== this && e.propose !== null && e.propose.x === this.propose.x && e.propose.y === this.propose.y;
		}

		if (!elves.some(e => test(e))) {
			this.x = this.propose.x;
			this.y = this.propose.y;
		}
	}
}

export class S23 extends Solver {
	createElves(input) {
		let elves = [];
		for (let y = 0; y < input.length; y++) {
			for (let x = 0; x < input[y].length; x++) {
				if (input[y][x] === '#') {
					elves.push(new Elf(x, y));
				}
			}
		}
		return elves;
	}

	countEmpty() {
		let xMin = Math.min(...this.elves.map(e => e.x));
		let xMax = Math.max(...this.elves.map(e => e.x)) + 1;
		let yMin = Math.min(...this.elves.map(e => e.y));
		let yMax = Math.max(...this.elves.map(e => e.y)) + 1;
		let count = 0;
		for (let x = xMin; x < xMax; x++) {
			for (let y = yMin; y < yMax; y++) {
				if (!this.elves.some(e => e.x === x && e.y === y)) { count++; }
			}
		}
		return count;
	}

	setup(input) {
		// input = "....#..\n..###.#\n#...#.#\n.#...##\n#.###..\n##.#.##\n.#..#..";
		input = input.split('\n').map(l => l.split(''));
		this.elves = this.createElves(input);
		let offset = 70;
		this.i = 0;
		let renderer = new ElfRenderer(input[0].length + 2 * offset, input.length + 2 * offset, 2, { x: offset, y: offset });
		this.setState({ solution: "Workning...", bmp: this.elves, renderer: renderer });
	}

	solve() {
		for (let i = 0; i < 1 && this.elves.some(e => e.propose !== null); i++) {
			this.elves.forEach(e => e.calculate(this.elves, this.i));
			this.elves.forEach(e => e.move(this.elves));
			this.i++;
			if (this.i === 10) { this.emptyAt10 = this.countEmpty(); }
		}
		if (this.elves.some(e => e.propose !== null)) {
			this.setState({ solution: `Calculating round ${this.i}`, bmp: this.elves });
		} else {
			return { solution: `Empty cells after round 10: ${this.emptyAt10}\nMoving complete at round: ${this.i}`, bmp: this.elves };
		}
	}
}
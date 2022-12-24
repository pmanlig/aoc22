// import React from 'react';
import Solver from './Solvers';
import { Renderer } from '../util';
// import { SearchState, PixelMap } from '../util';

const up = { x: 0, y: -1 }
const down = { x: 0, y: 1 }
const left = { x: -1, y: 0 }
const right = { x: 1, y: 0 }

const direction = {
	"^": up,
	"v": down,
	"<": left,
	">": right
}

const styles = {
	"#": "#1f1f1f",
	".": "#7fff7f",
	"^": "#cfcfcf",
	"v": "#7f7f7f",
	"<": "#9f9f9f",
	">": "#afafaf"
}

class Blizzard {
	constructor(x, y, dir) {
		this.x = x;
		this.y = y;
		this.dir = dir;
		this.delta = direction[dir];
	}

	move(bounds) {
		this.x += this.delta.x;
		this.y += this.delta.y;
		if (this.x === 0) { this.x = bounds.x - 2; }
		if (this.x === bounds.x - 1) { this.x = 1; }
		if (this.y === 0) { this.y = bounds.y - 2; }
		if (this.y === bounds.y - 1) { this.y = 1; }
	}
}

class BlizzardRenderer extends Renderer {
	constructor(input) {
		super(styles, input[0].length, input.length, 5);
	}

	draw(ctx, data) {
		super.draw(ctx, data);
		if (this.state) { this.drawPixel(ctx, this.state.x, this.state.y, "#ff0000"); }
	}
}

class State {
	constructor(x, y, time, target) {
		this.x = x;
		this.y = y;
		this.t = time;
		this.l = time + target.x - x + target.y - y;
	}

	generateMoves(board, target) {
		let m = [];
		m.push(new State(this.x, this.y, this.t + 1, target)); // Remain in place
		m.push(new State(this.x + 1, this.y, this.t + 1, target)); // Move right
		m.push(new State(this.x - 1, this.y, this.t + 1, target)); // Move left
		m.push(new State(this.x, this.y - 1, this.t + 1, target)); // Move up
		m.push(new State(this.x, this.y + 1, this.t + 1, target)); // Move down
		m = m.filter(s => s.x > 0 && s.y > -1 && s.y < board.length && board[s.y][s.x] === '.');
		return m;
	}

	length(target) {
		return this.t + (target.x - this.x) + (target.y - this.y);
	}
}

export class S24 extends Solver {
	cleanBoard(board) {
		return board.map(l => l.map(p => p === "#" ? "#" : "."));
	}

	createBlizzards(input) {
		let res = [];
		for (let y = 1; y < input.length - 1; y++) {
			for (let x = 1; x < input[y].length - 1; x++) {
				if (input[y][x].match(/[\^v<>]/)) {
					res.push(new Blizzard(x, y, input[y][x]));
				}
			}
		}
		return res;
	}

	newBoard(board) {
		let n = this.cleanBoard(board);
		this.blizzards.forEach(b => {
			b.move(this.bounds);
			n[b.y][b.x] = b.dir;
		});
		this.boards.push(n);
	}

	activeBoard() {
		return this.boards[this.states[this.states.length - 1].t % this.period];
	}

	solutionText() {
		const texts = [
			"There: ",
			"...and back: ",
			"...and back again: "
		]

		return this.solutions.map((s, i) => texts[i] + s.t + '\n').join('');
	}

	setup(input) {
		input = input.split('\n').map(l => l.split(''));
		this.bounds = { x: input[0].length, y: input.length }
		this.targets = [{ x: this.bounds.x - 2, y: this.bounds.y - 1 }, { x: 1, y: 0 }, { x: this.bounds.x - 2, y: this.bounds.y - 1 }]
		this.solutions = [];
		this.blizzards = this.createBlizzards(input);
		this.states = [new State(1, 0, 0, this.targets[0])];
		this.boards = [];
		this.period = (this.bounds.x - 2) * (this.bounds.y - 2);
		for (let i = 0; i < this.period; i++) { this.newBoard(input); }
		this.renderer = new BlizzardRenderer(input, this.cleanBoard(input));
		this.setState({ solution: `Ingen lösning än`, bmp: this.activeBoard(), renderer: this.renderer });
	}

	solve() {
		for (let i = 0; i < 1000; i++) {
			let s = this.states.pop();
			this.renderer.state = s;
			if (s.x === this.targets[0].x && s.y === this.targets[0].y) {
				this.targets.shift();
				this.solutions.push(s);
				if (this.targets.length === 0) {
					return {
						solution: this.solutionText(),
						bmp: this.boards[s.t % this.period]
					}
				}
				this.states = [s];
			}
			let m = s.generateMoves(this.boards[s.t % this.period], this.targets[0])
				.filter(n => !this.states.some(o => o.x === n.x && o.y === n.y && o.t === n.t));
			if (m.length > 0) {
				this.states = this.states
					.concat(m)
					.sort((a, b) => b.l === a.l ? a.t - b.t : b.l - a.l);
			}
		}
		this.setState({ solution: this.solutionText() + `Working... ${this.states.length}`, bmp: this.activeBoard() });
	}
}
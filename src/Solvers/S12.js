// import React from 'react';
import Solver from './Solvers';
import { Renderer } from '../util';

class PathRenderer extends Renderer {
	constructor(width, height, pixelSize, start, end, visited) {
		super(null, width, height, pixelSize);
		this.start = start;
		this.end = end;
		this.visited = visited;
	}

	draw(ctx, data) {
		let styles = (val, visited) => {
			if (val === 0) { return "#007F00"; }
			val *= 5;
			if (visited > -1) { val += 125; };
			val = val.toString(16);
			while (val.length < 2) { val = '0' + val; }
			return `#${val}${val}${val}`;
		}

		for (let y = 0; y < data.length; y++) {
			for (let x = 0; x < data[y].length; x++) {
				let style = styles(data[y][x], this.visited[y][x]);
				this.drawPixel(ctx, x, y, style);
			}
		}
		if (this.path) {
			for (let p = this.path; p; p = p.prev) {
				this.drawPixel(ctx, p.x, p.y, "#0000FF");
			}
		}
		this.drawPixel(ctx, this.start.x, this.start.y, "#00FF00");
		this.drawPixel(ctx, this.end.x, this.end.y, "#FF0000");
	}
}

class State {
	constructor(x, y, alt, prev) {
		this.x = x;
		this.y = y;
		this.alt = alt;
		this.prev = prev;
	}

	steps() {
		let s = 0, p = this.prev;
		while (p) { s++; p = p.prev; }
		return s;
	}

	dist(goal) {
		return Math.abs(this.x - goal.x) + Math.abs(this.y - goal.y);
	}
}

export class S12 extends Solver {
	setup(input) {
		if (!input) { return; }
		const norm = 'a'.charCodeAt(0);
		const start = 'S'.charCodeAt(0) - norm;
		const end = 'E'.charCodeAt(0) - norm;

		input = input.split('\n').map(l => l.split(''));
		let altitudes = input.map(l => l.map(c => c.charCodeAt(0) - norm));
		let visited = altitudes.map(l => l.map(c => -1));
		let init, goal;
		for (let y = 0; y < altitudes.length; y++) {
			for (let x = 0; x < altitudes[y].length; x++) {
				if (altitudes[y][x] === start) {
					altitudes[y][x] = 0;
					visited[y][x] = 0;
					init = new State(x, y, 0);
				}
				if (altitudes[y][x] === end) {
					altitudes[y][x] = 25;
					goal = { x: x, y: y };
				}
			}
		}
		let renderer = new PathRenderer(altitudes[0].length, altitudes.length, 5, init, goal, visited);
		let states = [init];
		this.setState({ bmp: altitudes, renderer: renderer, altitudes: altitudes, visited: visited, states: states, goal: goal });
	}

	solveA() {
		let { altitudes, states, goal, renderer } = this.state;
		if (!states) { return; }

		let addStep = (state, dx, dy) => {
			let nx = state.x + dx, ny = state.y + dy;
			if (ny > -1 && ny < altitudes.length && nx > -1 && nx < altitudes[ny].length && altitudes[ny][nx] <= state.alt + 1) {
				let o = renderer.visited[ny][nx] - 1;
				if (o === -2 || state.steps() < o) {
					states.push(new State(nx, ny, altitudes[ny][nx], state));
					renderer.visited[ny][nx] = state.steps() + 1;
				}
			}
		}

		for (let i = 0; i < 100; i++) {
			let s = states.pop();
			if (s.x === goal.x && s.y === goal.y) {
				renderer.path = s;
				renderer.visited = altitudes.map(l => l.map(c => -1));
				renderer.visited[goal.y][goal.x] = 0;
				this.setState({ solution: `Shortest distance: ${s.steps()}`, pathA: s, states: [new State(goal.x, goal.y, 25)] });
				return;
			}
			addStep(s, -1, 0);
			addStep(s, 1, 0);
			addStep(s, 0, -1);
			addStep(s, 0, 1);
			states.sort((a, b) => b.dist(goal) + b.steps() - a.dist(goal) - a.steps());
		}
		this.setState({ states: states, solution: `Working... (${states.length})` });
	}

	solveB() {
		let { pathA, altitudes, states, renderer } = this.state;

		let addStep = (state, dx, dy) => {
			let nx = state.x + dx, ny = state.y + dy;
			if (ny > -1 && ny < altitudes.length && nx > -1 && nx < altitudes[ny].length && altitudes[ny][nx] > state.alt - 2) {
				let o = renderer.visited[ny][nx] - 1;
				if (o === -2 || state.steps() < o) {
					states.push(new State(nx, ny, altitudes[ny][nx], state));
					renderer.visited[ny][nx] = state.steps() + 1;
				}
			}
		}

		for (let i = 0; i < 100; i++) {
			let s = states.pop();
			if (s.alt === 0) {
				renderer.path = s;
				return { solution: `Shortest distance: ${pathA.steps()}\nScenic distance: ${s.steps()}` };
			}
			addStep(s, -1, 0);
			addStep(s, 1, 0);
			addStep(s, 0, -1);
			addStep(s, 0, 1);
			states.sort((a, b) => b.steps() - a.steps());
		}
		this.setState({ solution: `Shortest distance: ${pathA.steps()}\nWorking... (${states.length})` });
	}

	solve() {
		let { pathA } = this.state;
		if (!pathA) {
			this.solveA();
		} else {
			return this.solveB();
		}
	}
}
// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S9 extends Solver {
	start = { x: 0, y: 0 }

	direction = {
		U: { x: 0, y: -1 },
		D: { x: 0, y: 1 },
		L: { x: -1, y: 0 },
		R: { x: 1, y: 0 }
	}

	move(a, dir) {
		a.x += dir.x;
		a.y += dir.y;
	}

	follow(a, b) {
		if (Math.abs(a.x - b.x) > 1 || Math.abs(a.y - b.y) > 1) {
			if (a.x > b.x) { a.x--; }
			if (a.x < b.x) { a.x++; }
			if (a.y > b.y) { a.y--; }
			if (a.y < b.y) { a.y++; }
		}
	}

	countVisited(input, knots) {
		let visited = [{ ...this.start }];
		input.forEach(s => {
			let dir = this.direction[s[0]];
			let steps = parseInt(s[1]);
			while (steps-- > 0) {
				this.move(knots[0], dir);
				for (let i = 1; i < knots.length; i++) {
					this.follow(knots[i], knots[i - 1]);
				}
				let tail = knots[knots.length - 1];
				if (!visited.some(p => p.x === tail.x && p.y === tail.y)) {
					visited.push({ ...tail });
				}
			}
		});
		return visited.length;
	}

	solve(input) {
		input = input.split('\n').map(l => /([^ ]) (\d+)/.exec(l).slice(1));
		let visited = this.countVisited(input, [{ ...this.start }, { ...this.start }]);
		let string = [], length = 10;
		while (length-- > 0) {
			string.push({ ...this.start });
		}
		let visited10 = this.countVisited(input, string);
		return { solution: `Positions visited (2 knots): ${visited}\nPositions visited (10 knots): ${visited10}` };
	}
}
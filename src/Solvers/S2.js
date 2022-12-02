// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S2 extends Solver {
	score = {
		A: { X: 4, Y: 8, Z: 3 },
		B: { X: 1, Y: 5, Z: 9 },
		C: { X: 7, Y: 2, Z: 6 }
	}

	strategy = {
		A: { X: 3, Y: 4, Z: 8 },
		B: { X: 1, Y: 5, Z: 9 },
		C: { X: 2, Y: 6, Z: 7 }
	}

	solve(input) {
		// input = 'A Y\nB X\nC Z';
		input = input.split('\n').map(l => l.split(' ')); //.map(c => this.values[c]));
		let score = input.map(g => this.score[g[0]][g[1]]).reduce((a, b) => a + b);
		let strategy = input.map(g => this.strategy[g[0]][g[1]]).reduce((a, b) => a + b);
		return { solution: `Total score: ${score}\nStrategic score: ${strategy}` };
	}
}
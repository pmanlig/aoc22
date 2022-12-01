// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S1 extends Solver {
	solve(input) {
		input = input.split('\n\n').map(i => i.split('\n').map(c => parseInt(c)).reduce((a, b) => a + b));
		input = input.sort((a, b) => b - a);
		return { solution: `Most calories carried: ${input[0]}\nTop three elves: ${input.slice(0, 3).reduce((a, b) => a + b)}` }
	}
}
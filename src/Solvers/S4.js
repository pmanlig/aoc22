// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S4 extends Solver {
	contains(a) {
		return (a[0] >= a[2] && a[1] <= a[3]) || (a[0] <= a[2] && a[1] >= a[3]);
	}

	overlaps(a) {
		return !(a[0] > a[3] || a[1] < a[2]);
	}

	solve(input) {
		input = input.split('\n').map(l => /(\d+)-(\d+),(\d+)-(\d+)/.exec(l).slice(1).map(n => parseInt(n, 10)));
		let contains = input.filter(a => this.contains(a)).length;
		let overlaps = input.filter(a => this.overlaps(a)).length;
		return { solution: `# of containing assignments: ${contains}\n# of overlapping assignments: ${overlaps}` };
	}
}
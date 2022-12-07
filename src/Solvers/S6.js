// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S6 extends Solver {
	marker(input, length) {
		for (let m = length; m < input.length; m++) {
			let x = {}
			let i = m - length;
			for (i = m - length; i < m; i++) {
				if (x[input[i]]) break;
				x[input[i]] = true;
			}
			if (i === m) return m;
		}
		return 0;
	}

	solve(input) {
		let startMarker = this.marker(input, 4);
		let msgMarker = this.marker(input, 14);
		return { solution: `Start marker found at: ${startMarker}\nMessage marker found at: ${msgMarker}` };
	}
}
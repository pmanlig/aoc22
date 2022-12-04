// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S3 extends Solver {
	priority(x) {
		const a = 'a'.charCodeAt(0);
		const z = 'z'.charCodeAt(0);
		const A = 'A'.charCodeAt(0);
		x = x.charCodeAt(0);
		if (x >= a && x <= z) return x - a + 1;
		return x - A + 27;
	}

	findCommon(x) {
		let first = x.substring(0, x.length / 2);
		let second = x.substring(x.length / 2);
		for (let i = 0; i < first.length; i++) {
			if (second.includes(first[i])) return first[i];
		}
	}

	badgeSum(input) {
		let sum = 0;
		for (let i = 0; i < input.length; i += 3) {
			for (let c = 0; c < input[i].length; c++) {
				let ch = input[i][c];
				if (input[i + 1].includes(ch) && input[i + 2].includes(ch)) {
					sum += this.priority(ch);
					c = input[i].length;
				}
			}
		}
		return sum;
	}

	solve(input) {
		input = input.split('\n');
		let prioritySum = input.map(l => this.priority(this.findCommon(l))).reduce((a, b) => a + b);
		let badgeSum = this.badgeSum(input);
		return { solution: `Sum of all prioritys: ${prioritySum}\nSum of all badges: ${badgeSum}` };
	}
}
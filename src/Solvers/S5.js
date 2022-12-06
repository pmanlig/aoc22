// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S5 extends Solver {
	topCrates(stacks, moves, moveProc) {
		let s = [null];
		// Clone stacks to make them reuseable
		for (let i = 1; i < stacks.length; i++) {
			s[i] = [...stacks[i]];
		}
		moves.forEach(m => moveProc(s, m.num, m.from, m.to));
		let topCrates = '';
		for (let i = 1; i < s.length; i++) {
			topCrates += s[i][s[i].length - 1];
		}
		return topCrates;
	}

	stacksFromCrates(crates) {
		let stacks = [], n = 1;
		for (let i = 0; i < crates[0].length; i++) {
			if (crates[0][i] !== ' ') {
				stacks[n++] = crates.slice(1).map(s => s[i]).filter(c => c !== ' ');
			}
		}
		return stacks;
	}

	solve(input) {
		input = input.split('\n\n');
		let stacks = this.stacksFromCrates(input[0].split('\n').reverse());
		let moves = input[1].split('\n')
			.map(l => /move (\d+) from (\d+) to (\d+)/.exec(l).slice(1).map(n => parseInt(n, 10)))
			.map(m => ({ num: m[0], from: m[1], to: m[2] }));
		let topCratesA = this.topCrates(stacks, moves, (s, num, from, to) => {
			for (let i = 0; i < num; i++) {
				s[to].push(s[from].pop());
			}
		})
		let topCratesB = this.topCrates(stacks, moves, (s, num, from, to) => {
			s[to] = s[to].concat(s[from].slice(-num));
			s[from] = s[from].slice(0, -num);
		});
		// console.log(crates, stacks, moves);
		return { solution: `Top crates for CratesMover 9000: ${topCratesA}\nTop crates for CratesMover 9001: ${topCratesB}` };
	}
}
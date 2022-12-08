// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S8 extends Solver {
	look(input, x, y, dx, dy) {
		let hgt = input[y][x];
		for (x += dx, y += dy; y >= 0 && y < input.length && x >= 0 && x < input[y].length; x += dx, y += dy) {
			if (input[y][x] >= hgt) return false;
		}
		return true;
	}

	countVisible(input) {
		let c = 0;
		for (let y = 0; y < input.length; y++) {
			for (let x = 0; x < input[y].length; x++) {
				if (this.look(input, x, y, 0, -1) ||
					this.look(input, x, y, 0, 1) ||
					this.look(input, x, y, -1, 0) ||
					this.look(input, x, y, 1, 0)) {
					c++;
				}
			}
		}
		return c;
	}

	visibleFrom(input, x, y, dx, dy) {
		let hgt = input[y][x];
		let l = 0;
		for (x += dx, y += dy; y >= 0 && y < input.length && x >= 0 && x < input[y].length; x += dx, y += dy) {
			l++;
			if (input[y][x] >= hgt) { break; }
		}
		return l;
	}

	scenic(input) {
		let s = 0;
		for (let y = 1; y < input.length - 1; y++) {
			for (let x = 1; x < input[y].length - 1; x++) {
				let n = this.visibleFrom(input, x, y, 0, -1) *
					this.visibleFrom(input, x, y, 0, 1) *
					this.visibleFrom(input, x, y, -1, 0) *
					this.visibleFrom(input, x, y, 1, 0);
				if (n > s) { s = n }
			}
		}
		return s;
	}

	solve(input) {
		input = input.split('\n').map(l => l.split('').map(n => parseInt(n, 10)));
		let visible = this.countVisible(input);
		let scenic = this.scenic(input);
		return { solution: `Number of visible trees: ${visible}\nBest scenic score: ${scenic}` };
	}
}
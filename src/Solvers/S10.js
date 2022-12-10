// import React from 'react';
import Solver from './Solvers';
// import { PixelMap } from '../util';

export class S10 extends Solver {
	signal(input, checks, output) {
		let x = 1, c = 1, s = 0, sig = 0;
		function cycle() {
			if (s < checks.length && checks[s] === c) { sig += checks[s++] * x; }
			output[c - 1] = Math.abs((c - 1) % 40 - x) < 2 ? 1 : 0;
			c++;
		}
		for (let i = 0; i < input.length; i++) {
			cycle();
			if (input[i][0] === "addx") {
				cycle();
				x += parseInt(input[i][1], 10);
			}
		}
		return sig;
	}

	solve(input) {
		input = input.split('\n').map(i => /(noop|addx).?([-\d]+)?/.exec(i).slice(1));
		let output = [];
		let total = this.signal(input, [20, 60, 100, 140, 180, 220], output);
		let bmp = [];
		while (output.length >= 40) {
			bmp.push(output.slice(0, 40));
			output = output.slice(40);
		}
		return {
			solution: `Total signal strength: ${total}`,
			bmp: bmp,
			styles: { 0: "#FFFFFF", 1: "#000000" },
			canvas: { width: 200, height: 35, pixel: 5 }
		};
	}
}
// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S13 extends Solver {
	parseList(l) {
		// console.log(l);
		if (l[0] === '[') {
			let n = [];
			let p = 1, b = 0;
			for (let i = 1; i < l.length - 1; i++) {
				if (l[i] === '[') b++;
				if (l[i] === ']') b--;
				if (l[i] === ',' && b === 0) {
					n.push(l.substring(p, i));
					p = i + 1;
				}
			}
			if (p < l.length - 1) { n.push(l.substring(p, l.length - 1)); }
			// console.log(`Substrings:\n${n.join('\n')}`);
			return n.map(it => this.parseList(it));
		}
		return parseInt(l, 10);
	}

	toString(obj) {
		if (typeof obj === 'object') {
			return `[${obj.map(i => this.toString(i)).join(',')}]`
		}
		return obj.toString();
	}

	compare(left, right) {
		// console.log(`Compare ${this.toString(left)} and ${this.toString(right)}`);
		if (typeof left === 'number' && typeof right === 'number') {
			return left === right ? 0 : (left < right ? 1 : -1);
		}
		if (typeof left === 'number') { left = [left]; }
		if (typeof right === 'number') { right = [right]; }

		for (let i = 0; i < left.length && i < right.length; i++) {
			let res = this.compare(left[i], right[i]);
			if (res !== 0) return res;
		}
		return left.length === right.length ? 0 : (left.length < right.length ? 1 : -1);
	}

	validate(p) {
		return this.compare(p[0], p[1]) === 1;
	}

	solve(input) {
		// input = "[[1],[10,[[7,4],6,[4,1,8],5],[4,6,[9,10,10]]]]\n[[9,[0,10,1,9],[[2,9,1,6]],6],[0,[9,[9,10,2],[6,0,5],5]]]";
		// input = "[[4,[[10,3,1,3],[8,1,7],[2,7,1,0,1],0],6,[3]],[9,[3]],[4,8,3,6,[8,9]],[[],10,5]]\n[[5,[9,4,1,5,[0,1,7,6]],1,3],[8,[3,[8,4,9,1],6,[5,9,2,1],1]],[7,[],9,[8]]]";

		input = input.split('\n\n');
		let packets = input.map(p => p.split('\n').map(i => this.parseList(i)));

		/*
		packets = [
			[[1, 1, 3, 1, 1], [1, 1, 5, 1, 1]],
			[[[1], [2, 3, 4]], [[1], 4]],
			[[9], [[8, 7, 6]]],
			[[[4, 4], 4, 4], [[4, 4], 4, 4, 4]],
			[[7, 7, 7, 7], [7, 7, 7]],
			[[], [3]],
			[[[[]]], [[]]],
			[[1, [2, [3, [4, [5, 6, 7]]]], 8, 9], [1, [2, [3, [4, [5, 6, 0]]]], 8, 9]]
		];
		//*/

		// console.log(`Compare:\n${this.toString([[6, [0, [9], 10, [0, 3, 7]], [7, 8, []], 10]])}\n${this.toString([[0], [9, [7]]])}`);
		// console.log(this.compare([[1], [10, [[7, 4], 6, [4, 1, 8], 5], [4, 6, [9, 10, 10]]]], [[9, [0, 10, 1, 9], [[2, 9, 1, 6]], 6], [0, [9, [9, 10, 2], [6, 0, 5], 5]]]));
		// packets = packets.filter(p => this.compare(p[0], p[1]) === 0);
		// console.log(packets);

		let sum = 0;
		for (let i = 0; i < packets.length; i++) {
			// console.log(`Comparing ${i + 1}:\n${input[i]}`);
			// console.log(`Packet ${i + 1}:\n${this.toString(packets[i][0])}\n${this.toString(packets[i][1])}`);
			// console.log(`Packet ${i + 1} is ${this.validate(packets[i]) ? "valid" : "invalid"}`);
			if (this.validate(packets[i])) { sum += i + 1; }
		}
		let allPackets = packets.flat().concat([[[2]], [[6]]]).sort((a, b) => this.compare(b, a));
		let decodeKey = (allPackets.findIndex(a => this.compare(a, [[2]]) === 0) + 1) * (allPackets.findIndex(b => this.compare(b, [[6]]) === 0) + 1);
		return { solution: `Sum of correct packages: ${sum}\nDecode key: ${decodeKey}` };
	}
}
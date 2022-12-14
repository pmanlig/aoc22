// import React from 'react';
import Solver from './Solvers';

export class S13 extends Solver {
	parseList(l) {
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
		input = input.split('\n\n');
		let packets = input.map(p => p.split('\n').map(i => this.parseList(i)));
		let sum = 0;
		for (let i = 0; i < packets.length; i++) {
			if (this.validate(packets[i])) { sum += i + 1; }
		}
		let allPackets = packets.flat().concat([[[2]], [[6]]]).sort((a, b) => this.compare(b, a));
		let decodeKey = (allPackets.findIndex(a => this.compare(a, [[2]]) === 0) + 1) * (allPackets.findIndex(b => this.compare(b, [[6]]) === 0) + 1);
		return { solution: `Sum of correct packages: ${sum}\nDecode key: ${decodeKey}` };
	}
}
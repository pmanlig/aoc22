// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

class Monkey {
	constructor(input) {
		this.id = input.match(/^(\w+):.*$/)[1];
		let val = input.match(/^\w+: (\d+)$/);
		if (val) { this.value = parseInt(val[1], 10); }
		else { this.expr = input.match(/^\w+: (\w+) ([+-/*]) (\w+)$/).slice(1); }
	}

	calc(monkeys) {
		let a = monkeys[this.expr[0]].eval(monkeys);
		let b = monkeys[this.expr[2]].eval(monkeys);
		switch (this.expr[1]) {
			case '-':
				return a - b;
			case '+':
				return a + b;
			case '/':
				return a / b;
			case '*':
				return a * b;
			default:
				throw new Error("Unsupported operation");
		}
	}

	eval(monkeys) {
		return this.value || this.calc(monkeys);
	}

	has(monkey, monkeys) {
		return this.id === monkey ||
			(this.expr &&
				(monkeys[this.expr[0]].has(monkey, monkeys) ||
					monkeys[this.expr[2]].has(monkey, monkeys)));
	}

	solve(x, val, monkeys) {
		if (this.id === x) { return val; }
		if (this.expr) {
			let a = this.expr[0];
			let b = this.expr[2];
			if (monkeys[a].has(x, monkeys)) {
				b = monkeys[b].eval(monkeys);
				switch (this.expr[1]) {
					case '-':  // val = a - b  <=>  a = val + b
						return monkeys[a].solve(x, val + b, monkeys);
					case '+':  // val = a + b  <=>  a = val - b
						return monkeys[a].solve(x, val - b, monkeys);
					case '/':  // val = a / b  <=>  a = val * b
						return monkeys[a].solve(x, val * b, monkeys);
					case '*':  // val = a * b  <=>  a = val / b
						return monkeys[a].solve(x, val / b, monkeys);
					default:
						throw new Error("Invalid operation!");
				}
			} else {
				a = monkeys[a].eval(monkeys);
				switch (this.expr[1]) {
					case '-':  // val = a - b  <=>  b = a - val
						return monkeys[b].solve(x, a - val, monkeys);
					case '+':  // val = a + b  <=>  b = val - a
						return monkeys[b].solve(x, val - a, monkeys);
					case '/':  // val = a / b  <=>  b = a / val
						return monkeys[b].solve(x, a / val, monkeys);
					case '*':  // val = a * b  <=>  b = val / a
						return monkeys[b].solve(x, val / a, monkeys);
					default:
						throw new Error("Invalid operation!");
				}
			}
		}
		throw new Error("Invalid call!");
	}
}

export class S21 extends Solver {
	solve(input) {
		input = input.split('\n').map(m => new Monkey(m));
		let monkeys = {}
		input.forEach(m => monkeys[m.id] = m);
		let root = monkeys.root.eval(monkeys);
		let a = monkeys.root.expr[0];
		let b = monkeys.root.expr[2];
		if (monkeys[a].has('humn', monkeys)) {
			a = b;
			b = monkeys.root.expr[0];
		}
		let x = monkeys[a].eval(monkeys);
		let humn = monkeys[b].solve('humn', x, monkeys);
		return { solution: `Root monkey: ${root}\nNumber to yell: ${humn}` };
	}
}
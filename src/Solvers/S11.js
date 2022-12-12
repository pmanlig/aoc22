// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

class Monkey {
	constructor(id, items, operation, test, ifTrue, ifFalse) {
		this.id = parseInt(id, 10);
		this.items = items.split(',').map(n => parseInt(n, 10));
		this.operation = /new = old (.) (.*)/.exec(operation).slice(1);
		this.test = parseInt(/divisible by (\d+)/.exec(test)[1], 10);
		this.ifTrue = parseInt(ifTrue, 10);
		this.ifFalse = parseInt(ifFalse, 10);
		this.business = 0;
	}
}

export class S11 extends Solver {
	round(monkeys, adjust) {
		monkeys.forEach(m => {
			m.business += m.items.length;
			m.items.forEach(i => {
				let x = m.operation[1] === "old" ? i : parseInt(m.operation[1], 10);
				i = m.operation[0] === "+" ? i + x : i * x;
				i = adjust(i);
				let toMonkey = i % m.test === 0 ? m.ifTrue : m.ifFalse;
				monkeys.find(m => m.id === toMonkey).items.push(i);
			});
			m.items = [];
		});
	}

	solve(input) {
		// eslint incorrectly thinks \* is unnecessary to escape...
		// eslint-disable-next-line
		const monkey_pattern = /^Monkey (\d+):\s+Starting items: ([\d, ]+)\s+Operation: ([\w \d=+\*]+)\s+Test: ([\w \d]+)\s+If true: throw to monkey (\d+)\s+If false: throw to monkey (\d+)/s;
		let monkeys = input.split('\n\n').map(m => monkey_pattern.exec(m).slice(1)).map(m => new Monkey(...m));
		for (let i = 0; i < 20; i++) {
			this.round(monkeys, i => Math.floor(i / 3));
		}
		let monkey_business = monkeys.map(m => m.business).sort((a, b) => b - a).slice(0, 2).reduce((a, b) => a * b);
		monkeys = input.split('\n\n').map(m => monkey_pattern.exec(m).slice(1)).map(m => new Monkey(...m));
		let div = monkeys.map(m => m.test).reduce((a, b) => a * b);
		for (let i = 0; i < 10000; i++) {
			this.round(monkeys, i => i % div);
		}
		let monkey_business_2 = monkeys.map(m => m.business).sort((a, b) => b - a).slice(0, 2).reduce((a, b) => a * b);
		return { solution: `Monkey business: ${monkey_business}\nWorrying monkey business: ${monkey_business_2}` };
	}
}
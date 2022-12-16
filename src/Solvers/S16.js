// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

class Valve {
	constructor(input) {
		let params = /Valve ([A-Z]+) has flow rate=(\d+); tunnels? leads? to valves? (.*)/.exec(input);
		if (null === params) { console.log(input); }
		this.id = params[1];
		this.flow = parseInt(params[2], 10);
		this.connections = params[3].split(', ');
	}
}

class State {
	constructor(s, opened, flow, accumulated, time, previous, max, valves, maxTime) {
		this.valve = s;
		this.opened = opened || [];
		this.flow = flow || 0;
		this.accumulated = accumulated || 0;
		this.time = time || 0;
		this.previous = previous || null;
		this.max = max;
		if (maxTime) { this.calculateMax(valves, maxTime); }
	}

	calculateMax(valves, maxTime) {
		if (this.time > (maxTime - 3)) {
			this.accumulated += (maxTime - this.time) * this.flow;
			this.time = maxTime;
		} else if (!this.max) {
			this.max = [];
			let base = this.accumulated + (maxTime - this.time) * this.flow;
			let remaining = (valves || []).filter(v => !this.opened.some(o => o === v)).map(v => v.flow).sort((a, b) => b - a);
			for (let i = this.time + 1; i < maxTime; i++) {
				this.max[i] = base;
				let v = 0;
				for (let t = i; t < maxTime; t += 2) {
					this.max[i] += (remaining[v++] || 0) * (maxTime - t)
				}
			}
			this.max[this.time] = this.max[this.time + 1];
			// console.log("Computing max", base, this.max, remaining);
		}
	}

	moves(valves, maxTime) {
		return this.valve.connections
			.map(c => valves.find(v => v.id === c))
			.filter(valve => valve !== this.previous)
			.map(v => new State(
				v,
				this.opened,
				this.flow,
				this.accumulated + this.flow,
				this.time + 1,
				this.valve,
				null,
				valves,
				maxTime
			)).concat(this.valve.flow > 0 && !this.opened.some(v => v === this.valve) ?
				[new State(this.valve,
					this.opened.concat([this.valve]),
					this.flow + this.valve.flow,
					this.accumulated + this.flow,
					this.time + 1,
					null,
					this.max,
					valves,
					maxTime)] :
				[]);
	}
}

export class S16 extends Solver {
	setup(input) {
		/*
		// eslint-disable-next-line
		input = "Valve AA has flow rate=0; tunnels lead to valves DD, II, BB\n\
		Valve BB has flow rate=13; tunnels lead to valves CC, AA\n\
		Valve CC has flow rate=2; tunnels lead to valves DD, BB\n\
		Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE\n\
		Valve EE has flow rate=3; tunnels lead to valves FF, DD\n\
		Valve FF has flow rate=0; tunnels lead to valves EE, GG\n\
		Valve GG has flow rate=0; tunnels lead to valves FF, HH\n\
		Valve HH has flow rate=22; tunnel leads to valve GG\n\
		Valve II has flow rate=0; tunnels lead to valves AA, JJ\n\
		Valve JJ has flow rate=21; tunnel leads to valve II";
		// Expected: DD, BB, JJ, HH, EE, CC - 1651 pressure
		//*/
		this.valves = input.split('\n').map(l => new Valve(l));
		let start = this.valves.find(v => v.id === "AA");
		this.part1 = { best: null, states: [new State(start)] };
		this.part2 = { best: null, states: [new State(start)] };
		this.helper = { best: null, states: [new State(start)], started: false };
	}

	solvePart(search, maxTime) {
		const viable = s => {
			return search.best === null ||
				(s.max[s.time] > search.best.accumulated);
		}

		for (let i = 0; search.states.length > 0 && i < 5000; i++) {
			let s = search.states.pop();
			if (s.time < maxTime && viable(s)) {
				search.states = search.states.concat(s.moves(this.valves, maxTime)).sort((a, b) => a.time - b.time);
			} else if (s.time === maxTime && (search.best === null || s.accumulated > search.best.accumulated)) {
				search.best = s;
			}
		}
		return search;
	}

	solve() {
		if (!this.part1 || !this.part2) { return; }
		let best = this.part1.best && this.part1.best.accumulated;
		let best2 = this.part2.best && this.part2.best.accumulated;
		let best3 = this.helper.best && this.helper.best.accumulated;
		let remaining = this.part1.states.length + this.part2.states.length + this.helper.states.length;
		this.setState({ solution: `States remaining: ${remaining}\nBest flow (alone): ${best}\nBest flow (helper): ${best2}+${best3}` });

		if (this.part1.states.length > 0) { this.solvePart(this.part1, 30); }
		else if (this.part2.states.length > 0) { this.solvePart(this.part2, 26); }
		else if (this.helper.started === false) {
			this.helper.started = true;
			this.helper.states[0].opened = this.part2.best.opened;
		} else if (this.helper.states.length > 0) { this.solvePart(this.helper, 26); }
		else {
			return { solution: `Best flow (alone): ${best}\nBest flow (helper): ${best2 + best3}` };
		}
	}
}
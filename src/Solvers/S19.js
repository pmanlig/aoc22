// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

const ore = 0;
const clay = 1;
const obsidian = 2;
const geode = 3;

class Blueprint {
	constructor(input) {
		this.id = parseInt(/Blueprint (\d+)/.exec(input)[1], 10);
		this.ore = [parseInt(/Each ore robot costs (\d+)/.exec(input)[1], 10), 0, 0, 0];
		this.clay = [parseInt(/Each clay robot costs (\d+)/.exec(input)[1], 10), 0, 0, 0];
		this.obsidian = /Each obsidian robot costs (\d+) ore and (\d+) clay/
			.exec(input).slice(1).map(n => parseInt(n, 10)).concat([0, 0]);
		this.geode = /Each geode robot costs (\d+) ore and (\d+) obsidian/
			.exec(input).slice(1).map(n => parseInt(n, 10)).concat([0]);
		this.geode.splice(1, 0, 0);
		this.maxOre = Math.max(this.ore[ore], this.clay[ore], this.obsidian[ore], this.geode[ore]);
	}

	makeOre(resources) { return resources.map((v, i) => v - this.ore[i]); }
	makeClay(resources) { return resources.map((v, i) => v - this.clay[i]); }
	makeObsidian(resources) { return resources.map((v, i) => v - this.obsidian[i]); }
	makeGeode(resources) { return resources.map((v, i) => v - this.geode[i]); }
}

class State {
	constructor(time, robots, resources, maxTime) {
		this.time = time;
		this.robots = robots;
		this.resources = resources;
		let d = maxTime - time;
		this.max = resources[geode] + robots[geode] * d + d * (d - 1) / 2;
	}

	produce(time) {
		return this.resources.map((v, i) => v + time * this.robots[i]);
	}

	addRobot(type) {
		return this.robots.map((r, i) => i === type ? r + 1 : r);
	}

	generateMoves(blueprint, maxTime) {
		let moves = []
		// Create geode
		if (this.robots[obsidian] > 0) {
			let obsidianTime = Math.ceil((blueprint.geode[obsidian] - this.resources[obsidian]) / this.robots[obsidian]);
			let oreTime = Math.ceil((blueprint.geode[ore] - this.resources[ore]) / this.robots[ore]);
			let time = Math.max(obsidianTime, oreTime, 0) + 1;
			if ((this.time + time) <= maxTime)
				moves.push(new State(this.time + time, this.addRobot(geode), blueprint.makeGeode(this.produce(time)), maxTime));
		}
		if (this.robots[clay] > 0 && this.robots[obsidian] < blueprint.geode[obsidian]) {
			let clayTime = Math.ceil((blueprint.obsidian[clay] - this.resources[clay]) / this.robots[clay]);
			let oreTime = Math.ceil((blueprint.obsidian[ore] - this.resources[ore]) / this.robots[ore]);
			let time = Math.max(clayTime, oreTime, 0) + 1;
			if ((this.time + time) <= maxTime)
				moves.push(new State(this.time + time, this.addRobot(obsidian), blueprint.makeObsidian(this.produce(time)), maxTime));
		}
		if (this.robots[clay] < blueprint.obsidian[clay]) {
			let time = Math.max(Math.ceil((blueprint.clay[ore] - this.resources[ore]) / this.robots[ore]), 0) + 1;
			if ((this.time + time) <= maxTime)
				moves.push(new State(this.time + time, this.addRobot(clay), blueprint.makeClay(this.produce(time)), maxTime));
		}
		if (this.robots[ore] < blueprint.maxOre) {
			let time = Math.max(Math.ceil((blueprint.ore[ore] - this.resources[ore]) / this.robots[ore]), 0) + 1;
			if ((this.time + time) <= maxTime) {
				moves.push(new State(this.time + time, this.addRobot(ore), blueprint.makeOre(this.produce(time)), maxTime));
			}
		}
		moves.push(new State(maxTime, this.robots, this.produce(maxTime - this.time), maxTime));
		return moves;
	}
}

export class S19 extends Solver {
	initSearch() {
		this.current = this.queue.pop();
		let { bp, max } = this.current;
		let time = Math.min(bp.ore[ore], bp.clay[ore]);
		this.states = [new State(time, [1, 0, 0, 0], [time, 0, 0, 0], max)];
		this.best = 0;
	}

	search() {
		let { bp, max } = this.current;
		for (let i = 0; i < 10000 && this.states.length > 0; i++) {
			let s = this.states.pop();
			if (s.time === max) {
				if (this.best < s.resources[geode]) {
					this.best = s.resources[geode];
				}
			} else if (s.max > this.best) {
				this.states = this.states.concat(s.generateMoves(bp, max));
				this.states.sort((a, b) => a.time - b.time);
			}
		}
	}

	setup(input) {
		// input = "Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.\nBlueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.";
		let blueprints = input.split('\n').map(l => new Blueprint(l));
		this.queue = blueprints.map(b => ({ bp: b, max: 24, mul: b.id }))
			.concat(blueprints.slice(0, 3).map(b => ({ bp: b, max: 32, mul: 1 })))
			.reverse();
		this.QL = [];
		this.initSearch();
	}

	solve() {
		this.search();
		if (this.states.length === 0) {
			this.QL.push(this.best * this.current.mul);
			if (this.queue.length > 0) {
				this.initSearch();
			} else {
				let tql = this.QL.slice(0, 30).reduce((a, b) => a + b);
				let tgd = this.QL.slice(30).reduce((a, b) => a * b);
				return { solution: `Total quality level: ${tql}\nGeode product: ${tgd}` }
			}
		}
		this.setState({ solution: `Working on blueprint ${this.current.bp.id}\nCurrent result:\n${this.QL.join('\n')}\n${this.best}` });
	}
}
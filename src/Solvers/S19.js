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
	}

	hasResources(resources, demand) { return !resources.some((v, i) => v < demand[i]); }
	canMakeOre(resources) { return this.hasResources(resources, this.ore); }
	canMakeClay(resources) { return this.hasResources(resources, this.clay); }
	canMakeObsidian(resources) { return this.hasResources(resources, this.obsidian); }
	canMakeGeode(resources) { return this.hasResources(resources, this.geode); }

	makeOre(resources) { return resources.map((v, i) => v - this.ore[i]); }
	makeClay(resources) { return resources.map((v, i) => v - this.clay[i]); }
	makeObsidian(resources) { return resources.map((v, i) => v - this.obsidian[i]); }
	makeGeode(resources) { return resources.map((v, i) => v - this.geode[i]); }
}

class State {
	constructor(time, robots, resources, mayCreate) {
		this.time = time;
		this.robots = robots;
		this.resources = resources;
		this.mayCreate = mayCreate || [true, true, true, true];
	}

	produce() {
		return this.resources.map((v, i) => v + this.robots[i]);
	}

	addRobot(type) {
		return this.robots.map((r, i) => i === type ? r + 1 : r);
	}

	generateMoves(blueprint) {
		let newTime = this.time + 1;
		let newResources = this.produce();
		let mayCreate = [...this.mayCreate];
		// if (newResources[geode] > 0) console.log(newResources);

		let moves = []
		if (mayCreate[geode] && blueprint.canMakeGeode(this.resources)) {
			moves.push(new State(newTime, this.addRobot(geode), blueprint.makeGeode(newResources)));
			mayCreate[geode] = false;
		}
		if (mayCreate[obsidian] && blueprint.canMakeObsidian(this.resources)) {
			// console.log("Created obsidian robot");
			moves.push(new State(newTime, this.addRobot(obsidian), blueprint.makeObsidian(newResources)));
			mayCreate[obsidian] = false;
		}
		if (mayCreate[clay] && blueprint.canMakeClay(this.resources)) {
			// console.log("Created clay robot");
			moves.push(new State(newTime, this.addRobot(clay), blueprint.makeClay(newResources)));
			mayCreate[clay] = false;
		}
		if (mayCreate[ore] && blueprint.canMakeOre(this.resources)) {
			// console.log("Created ore robot");
			moves.push(new State(newTime, this.addRobot(ore), blueprint.makeOre(newResources)));
			mayCreate[ore] = false;
		}
		return moves.concat([new State(newTime, this.robots, newResources, mayCreate)]);
	}
}

export class S19 extends Solver {
	initSearch() {
		let b = this.blueprints[this.current];
		let time = Math.min(b.ore[ore], b.clay[ore]);
		this.states = [new State(time, [1, 0, 0, 0], [time, 0, 0, 0])]
	}

	setup(input) {
		// input = "Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.\nBlueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.";
		this.blueprints = input.split('\n').map(l => new Blueprint(l));
		this.current = 0;
		this.QL = [];
		// this.QL = [2, 1, 0, 0, 1, 0, 2, 1, 6, 0, 2, 0, 3, 0, 0, 0, 0, 8, 5, 0, 0, 0, 9, 9, 3, 0, 1, 7, 0, 8];
		this.initSearch();
	}

	solve() {
		for (let i = 0; i < 10000 && this.states.length > 0; i++) {
			let s = this.states.pop();
			if (s.time === 24) {
				if (this.QL[this.current] === undefined || this.QL[this.current] < s.resources[geode]) {
					this.QL[this.current] = s.resources[geode];
				}
			} else {
				this.states = this.states.concat(s.generateMoves(this.blueprints[this.current]));
				this.states.sort((a, b) => a.time - b.time);
			}
		}
		if (this.states.length === 0) {
			if (this.QL.length === this.blueprints.length) {
				let tql = this.QL.map((v, i) => v * this.blueprints[i].id).reduce((a, b) => a + b);
				return { solution: `Total quality level: ${tql}\n${this.QL.join('\n')}` }
			} else {
				this.current++;
				this.initSearch();
			}
		}
		this.setState({ solution: `Working on blueprint ${this.blueprints[this.current].id}\nCurrent result:\n${this.QL.join('\n')}` });
	}
}
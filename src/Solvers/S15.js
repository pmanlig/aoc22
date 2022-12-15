// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

function distance(x1, y1, x2, y2) {
	return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

class Sensor {
	constructor(x, y, bx, by) {
		this.x = x;
		this.y = y;
		this.beaconX = bx;
		this.beaconY = by;
		this.range = distance(x, y, bx, by);
	}

	inRange(x, y) {
		return !(distance(x, y, this.x, this.y) > this.range);
	}
}

export class S15 extends Solver {
	solve(input) {
		/*
		// eslint-disable-next-line
		input = "Sensor at x=2, y=18: closest beacon is at x=-2, y=15\n\
		Sensor at x=9, y=16: closest beacon is at x=10, y=16\n\
		Sensor at x=13, y=2: closest beacon is at x=15, y=3\n\
		Sensor at x=12, y=14: closest beacon is at x=10, y=16\n\
		Sensor at x=10, y=20: closest beacon is at x=10, y=16\n\
		Sensor at x=14, y=17: closest beacon is at x=10, y=16\n\
		Sensor at x=8, y=7: closest beacon is at x=2, y=10\n\
		Sensor at x=2, y=0: closest beacon is at x=2, y=10\n\
		Sensor at x=0, y=11: closest beacon is at x=2, y=10\n\
		Sensor at x=20, y=14: closest beacon is at x=25, y=17\n\
		Sensor at x=17, y=20: closest beacon is at x=21, y=22\n\
		Sensor at x=16, y=7: closest beacon is at x=15, y=3\n\
		Sensor at x=14, y=3: closest beacon is at x=15, y=3\n\
		Sensor at x=20, y=1: closest beacon is at x=15, y=3";
		//*/

		let sensors = input.split('\n')
			.map(l =>
				/Sensor at x=([-\d]+), y=([-\d]+): closest beacon is at x=([-\d]+), y=([-\d]+)/.exec(l)
					.slice(1)
					.map(n => parseInt(n, 10)))
			.map(l => new Sensor(...l));
		// console.log(sensors);

		let minx = Math.min(...sensors.map(s => s.x));
		let maxx = Math.max(...sensors.map(s => s.x));
		// let miny = Math.min(...sensors.map(s => s.y));
		// let maxy = Math.max(...sensors.map(s => s.y));
		let maxd = Math.max(...sensors.map(s => s.range));
		// console.log(`Dimensions: ${maxx - minx}×${maxy - miny}`);

		const isBeacon = (x, y) => {
			return sensors.find(s => s.beaconX === x && s.beaconY === y) !== undefined;
		}
		const inRange = (x, y) => {
			return sensors.find(s => s.inRange(x, y));
		}
		let c = 0;
		const line = 2000000;
		for (let i = minx - maxd; i < maxx + maxd + 1; i++) {
			if (!isBeacon(i, line) && inRange(i, line)) { c++; }
			// console.log(i, this.inSensorCoverage(i, 10, sensors));
			// if (this.inSensorCoverage(i, 10, sensors)) { c++; }
		}

		let freq = 0;
		const limit = 4000001;
		for (let x = 0; x < limit; x++) {
			for (let y = 0; y < limit; y++) {
				let s = inRange(x, y);
				if (s === undefined) {
					freq = 4000000 * x + y
				} else {
					y = s.y + s.range - Math.abs(x - s.x);
				}
			}
		}

		return { solution: `Number of cells outside sensor coverage: ${c}\nTuning frequency: ${freq}` };
	}
}
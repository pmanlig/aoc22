// import React from 'react';
import Solver from './Solvers';
import { Renderer } from '../util';

class Position {
	constructor(input) {
		let d = input.split(',').map(i => parseInt(i, 10));
		this.x = d[0];
		this.y = d[1];
	}
}

class CaveRenderer extends Renderer {
	constructor(bounds) {
		super({ 0: "#dfdfdf", 1: "#000000", 2: "#7f7f00" }, bounds.width, bounds.height, 2);
	}

	draw(ctx, data) {
		super.draw(ctx, data);
	}
}

export class S14 extends Solver {
	createBitmap(bounds) {
		let data = [];
		for (let y = 0; y < bounds.height; y++) {
			data[y] = [];
			for (let x = 0; x < bounds.width; x++) {
				data[y][x] = 0;
			}
		}
		return data;
	}

	putStoneAt(data, x, y) {
		data[y][x] = 1;
	}

	addStone(data, input, bounds) {
		input.forEach(l => {
			let p = l[0];
			this.putStoneAt(data, p.x - bounds.xmin, p.y);
			for (let i = 1; i < l.length; i++) {
				let dx = l[i].x === p.x ? 0 : (l[i].x > p.x ? 1 : -1);
				let dy = l[i].y === p.y ? 0 : (l[i].y > p.y ? 1 : -1);
				while (p.x !== l[i].x || p.y !== l[i].y) {
					p.x += dx;
					p.y += dy;
					this.putStoneAt(data, p.x - bounds.xmin, p.y);
				}
			}
		});

	}

	findBounds(input) {
		let bounds = { xmin: input[0][0].x, xmax: input[0][0].x, ymin: input[0][0].y, ymax: input[0][0].y }
		input.flat().forEach(p => {
			if (p.x < bounds.xmin) bounds.xmin = p.x;
			if (p.x > bounds.xmax) bounds.xmax = p.x;
			if (p.y < bounds.ymin) bounds.ymin = p.y;
			if (p.y > bounds.ymax) bounds.ymax = p.y;
		});
		bounds.ymax += 10;
		bounds.height = bounds.ymax;
		bounds.xmin += -bounds.height;
		bounds.xmax += bounds.height;
		bounds.width = bounds.xmax - bounds.xmin;
		return bounds;
	}

	addSand(data, bounds) {
		let s = { x: 500 - bounds.xmin, y: 0 }
		while (s.y + 1 < bounds.ymax) {
			if (data[s.y + 1][s.x] === 0) { // OK, keep dropping
				s.y++;
			} else if (data[s.y + 1][s.x - 1] === 0) { // drop left
				s.y++;
				s.x--;
			} else if (data[s.y + 1][s.x + 1] === 0) { // drop right
				s.y++;
				s.x++;
			} else { // remain at rest
				if (data[s.y][s.x] > 0) { return false; }
				data[s.y][s.x] = 2;
				return true;
			}
		}
		return false;
	}

	addFloor(data, bounds) {
		for (let x = 0; x < bounds.width; x++) {
			data[bounds.ymax - 8][x] = 1;
		}
	}

	setup(input) {
		// input = "498,4 -> 498,6 -> 496,6\n503,4 -> 502,4 -> 502,9 -> 494,9"
		input = input.split('\n').map(l => l.match(/(\d+),(\d+)/g).map(p => new Position(p)));
		let bounds = this.findBounds(input);
		let data = this.createBitmap(bounds);
		this.addStone(data, input, bounds);
		let renderer = new CaveRenderer(bounds);
		this.setState({ sandCount: 0, floorCount: 0, bounds: bounds, bmp: data, renderer: renderer });
	}

	solve() {
		let { sandCount, floorCount, bmp, bounds } = this.state;
		if (!bounds) return;
		for (let i = 0; i < 1000; i++) {
			if (floorCount === 0) {
				if (this.addSand(bmp, bounds)) { sandCount++; }
				else {
					floorCount = sandCount;
					this.addFloor(bmp, bounds);
				}
			} else {
				if (this.addSand(bmp, bounds)) { floorCount++; }
				else { return { solution: `Sand count (infinite abyss): ${sandCount}\nSand count (floor): ${floorCount}`, bmp: bmp } }
			}
		}
		this.setState({ sandCount: sandCount, floorCount: floorCount, bmp: bmp });
	}
}
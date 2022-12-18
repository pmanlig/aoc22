import Solver from './Solvers';
import { Renderer } from '../util';

export class S18 extends Solver {
	directions = [
		[1, 0, 0],
		[-1, 0, 0],
		[0, 1, 0],
		[0, -1, 0],
		[0, 0, 1],
		[0, 0, -1]
	];

	calculateSurface(input) {
		let surface = 0;
		input.forEach(c => {
			surface += 6;
			this.directions.forEach(d => {
				if (input.some(n => n[0] === c[0] + d[0] && n[1] === c[1] + d[1] && n[2] === c[2] + d[2])) {
					surface--;
				}
			});
		});
		return surface;
	}

	getBounds(input) {
		let bounds = {
			xmin: input[0][0],
			xmax: input[0][0],
			ymin: input[0][1],
			ymax: input[0][1],
			zmin: input[0][2],
			zmax: input[0][2]
		};
		input.forEach(c => {
			for (let i = 0; i < 3; i++) {
				bounds.xmin = Math.min(c[0], bounds.xmin);
				bounds.xmax = Math.max(c[0], bounds.xmax);
				bounds.ymin = Math.min(c[1], bounds.ymin);
				bounds.ymax = Math.max(c[1], bounds.ymax);
				bounds.zmin = Math.min(c[2], bounds.zmin);
				bounds.zmax = Math.max(c[2], bounds.zmax);
			}
		});
		bounds.xmax++;
		bounds.ymax++;
		bounds.zmax++;
		return bounds;
	}

	inflateBounds({ xmin, xmax, ymin, ymax, zmin, zmax }) {
		xmin--;
		xmax++;
		ymin--;
		ymax++;
		zmin--;
		zmax++;
		return { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, zmin: zmin, zmax: zmax }
	}

	initializeGrid(input, { xmin, xmax, ymin, ymax, zmin, zmax }) {
		let grid = [];
		for (let x = xmin; x < xmax; x++) {
			grid[x] = [];
			for (let y = ymin; y < ymax; y++) {
				grid[x][y] = [];
				for (let z = zmin; z < zmax; z++) {
					grid[x][y][z] = input.some(l => l[0] === x && l[1] === y && l[2] === z) ? 1 : 0;
				}
			}
		}
		return grid;
	}

	fillWithWater(grid, { xmin, xmax, ymin, ymax, zmin, zmax }) {
		let state = [{ x: xmin, y: ymin, z: zmin }];
		while (state.length > 0) {
			let s = state.pop();
			grid[s.x][s.y][s.z] = 2;
			state = state.concat(this.directions
				.map(d => ({ x: d[0] + s.x, y: d[1] + s.y, z: d[2] + s.z }))
				.filter(p => p.x >= xmin && p.x < xmax && p.y >= ymin && p.y < ymax && p.z >= zmin && p.z < zmax)
				.filter(p => grid[p.x][p.y][p.z] === 0));
		}
	}

	calculateExternalSurface(input, grid) {
		let external = 0;
		input.forEach(c => {
			external += this.directions
				.map(d => ({ x: c[0] + d[0], y: c[1] + d[1], z: c[2] + d[2] }))
				.filter(p => grid[p.x][p.y][p.z] === 2)
				.length
		});
		return external;
	}

	generateImage(grid, { xmin, xmax, ymin, ymax, zmin, zmax }) {
		let img = [];
		for (let x = xmin; x < xmax; x++) {
			img[x] = [];
			for (let y = ymin; y < ymax; y++) {
				img[x][y] = 0;
				for (let z = zmin; z < zmax; z++) {
					if (grid[x][y][z] === 1) break;
					img[x][y]++;
				}
			}
		}
		return img;
	}

	solve(input) {
		input = input.split('\n').map(l => l.split(',').map(n => parseInt(n, 10)));
		let surface = this.calculateSurface(input);
		let bounds = this.getBounds(input);
		let inflatedBounds = this.inflateBounds(bounds);
		let grid = this.initializeGrid(input, inflatedBounds);
		this.fillWithWater(grid, inflatedBounds);
		let external = this.calculateExternalSurface(input, grid);
		let bmp = this.generateImage(grid, bounds);
		const styles = val => {
			val = Math.floor(255 * val / (bounds.zmax - bounds.zmin));
			val = val.toString(16);
			while (val.length < 2) val = '0' + val;
			return `#${val}${val}${val}`;
		}
		let rend = new Renderer(styles, bmp[0].length, bmp.length, 10);
		return { solution: `Total surface: ${surface}\nExternal surface: ${external}`, bmp: bmp, renderer: rend };
	}
}
// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

export class S7 extends Solver {
	parseTree(input) {
		let root = {};
		let current = root;
		input.forEach(l => {
			let cmd = /^\$ cd (.*)/.exec(l);
			if (null !== cmd) {
				cmd[1].split('/').forEach(d => {
					switch (d) {
						case "":
							current = root;
							break;
						case "..":
							current = current.parent;
							break;
						default:
							current = current[d];
					}
				});
			}
			cmd = /^\$ ls$/.exec(l); // ignore
			cmd = /^dir (.*)$/.exec(l);
			if (cmd !== null) {
				current[cmd[1]] = { parent: current }
			}
			cmd = /^(\d+) (.*)$/.exec(l);
			if (null !== cmd) {
				current[cmd[2]] = parseInt(cmd[1], 10);
			}
		});
		return root;
	}

	findDirectories(dir, path) {
		let dirs = [], size = 0;
		Object.keys(dir).filter(k => k !== "parent").forEach(k => {
			if (typeof (dir[k]) === "number") {
				size += dir[k];
			} else {
				let p = path + k + '/';
				let sub = this.findDirectories(dir[k], p);
				dirs = dirs.concat(sub);
				sub.forEach(d => {
					if (d.path === p) {
						size += d.size;
					}
				});
			}
		});
		dirs.push({
			path: path,
			size: size
		});
		return dirs;
	}

	solve(input) {
		input = input.split('\n');
		let root = this.parseTree(input);
		let directories = this.findDirectories(root, "/");
		let size = directories.map(d => d.size).filter(d => d < 100000).reduce((a, b) => a + b);
		let free = 70000000 - directories.filter(d => d.path === "/")[0].size;
		let need = 30000000 - free;
		let del = directories.filter(d => d.size >= need).sort((a,b) => a.size - b.size);
		return { solution: `Total directory size: ${size}\nDeletion size: ${del[0].size}` };
	}
}
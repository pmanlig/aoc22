// import React from 'react';
import Solver from './Solvers';
// import { SearchState, PixelMap } from '../util';

class Link {
	constructor(val, prev, next) {
		this.val = val;
		this.prev = prev;
		this.next = next;
	}
}

export class S20 extends Solver {
	logList(link) {
		let nums = [link.val];
		let current = link;
		while (current.next !== link) {
			current = current.next;
			nums.push(current.val);
		}
		console.log(nums);
	}

	moveLink(l, mod) {
		let n = l.val % mod;
		if (n !== 0) {
			l.prev.next = l.next;
			l.next.prev = l.prev;
			while (n > 0) { l.next = l.next.next; n--; }
			while (n < 0) { l.prev = l.prev.prev; n++; }
			if (l.val > 0) { l.prev = l.next.prev; }
			else { l.next = l.prev.next; }
			l.next.prev = l;
			l.prev.next = l;
		}
	}

	createList(input) {
		let head = null, current = null, links = [];
		input.forEach(n => {
			let newLink = new Link(n, current, null);
			if (current !== null) { current.next = newLink; }
			current = newLink;
			if (head === null) { head = current; }
			links.push(newLink);
		});
		current.next = head;
		head.prev = current;
		return links;
	}

	findCoordinates(link) {
		let coords = [];
		for (let i = 0; i < 1000; i++) { link = link.next; }
		coords.push(link.val);
		for (let i = 0; i < 1000; i++) { link = link.next; }
		coords.push(link.val);
		for (let i = 0; i < 1000; i++) { link = link.next; }
		coords.push(link.val);
		return coords;
	}

	solve(input) {
		// input = "1\n2\n-3\n3\n-2\n0\n4";
		input = input.split('\n').map(n => parseInt(n, 10));
		let mod = input.length - 1;
		let links = this.createList(input);
		links.forEach(l => this.moveLink(l, mod));
		let coordsSimple = this.findCoordinates(links.find(l => l.val === 0));
		let key = 811589153;
		links = this.createList(input.map(n => n * key));
		for (let i = 0; i < 10; i++) {
			links.forEach(l => this.moveLink(l, mod));
		}
		let coordExt = this.findCoordinates(links.find(l => l.val === 0));
		return { solution: `Coordinates (simple): ${coordsSimple[0]} + ${coordsSimple[1]} + ${coordsSimple[2]} = ${coordsSimple[0] + coordsSimple[1] + coordsSimple[2]}\nCoordinates (extended): ${coordExt[0]} + ${coordExt[1]} + ${coordExt[2]} = ${coordExt[0] + coordExt[1] + coordExt[2]}` };
	}
}
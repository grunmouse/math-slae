const assert = require('assert');
assert.toleranceEqual = function(actual, expected, message){
	assert.ok(Math.abs(actual - expected) < Number.EPSILON, message + " " + actual + " == " + expected);
};

const lineSystem = require('../line-system.js');

describe('system 2/4', ()=>{
	let A = [
		[1, 9, 4, 0],
		[0, 1, 5, -1]
	];
	let b = [8, 10];
	
	function testing(target){
		let calc = lineSystem(A, b, target);
		it('function', ()=>{
			assert.ok(calc instanceof Function);
		});
		
	};
	
	describe('0,1', ()=>{
		let target = [0,1];
		let calc = lineSystem(A, b, target);
		it('calc', ()=>{
			assert.ok(calc instanceof Function);
		});
		it('calculate', ()=>{
			let x = {2:1, 3:-1};
			let result = calc(x);
			
			assert.equal(result[0], (-82 + 41*x[2] - 9*x[3]), 'x[0]');
			assert.equal(result[1], (10 - 5*x[2] + x[3]), 'x[1]');
		});
	});
	//describe('0,2', ()=>(testing([0,2])));
	//describe('0,3', ()=>(testing([0,3])));
	//describe('1,2', ()=>(testing([1,2])));
	//describe('1,3', ()=>(testing([1,3])));
	//describe('2,3', ()=>(testing([2,3])));
});
const assert = require('assert');
assert.toleranceEqual = function(actual, expected, message){
	assert.ok(Math.abs(actual - expected) < Number.EPSILON, message + " " + actual + " == " + expected);
};

const lineEquation = require('../line-equation.js');

describe('equation 3', ()=>{
	let A = [1, 9, 4, 0];
	let b = 8;
	
	function testing(target){
		let calc = lineSystem(A, b, target);
		it('function', ()=>{
			assert.ok(calc instanceof Function);
		});
		
	};
	
	describe('0', ()=>{
		let target = 0;
		let calc = lineEquation(A, b, target);
		it('calc', ()=>{
			assert.ok(calc instanceof Function);
		});
		it('calculate', ()=>{
			let x = {2:1, 1:-1};
			let result = calc(x);
			
			assert.equal(result, 8 - 9*x[1] - 4*x[2], 'x[0]');
			
		});
	});
});

describe('equation 1', ()=>{
	let A = [ 0, 1, 0, -0 ];
	let b = 8;
	
	function testing(target){
		let calc = lineSystem(A, b, target);
		it('function', ()=>{
			assert.ok(calc instanceof Function);
		});
		
	};
	
	describe('1', ()=>{
		let target = 1;
		let calc = lineEquation(A, b, target);
		it('calc', ()=>{
			assert.ok(calc instanceof Function);
		});
		it('calculate', ()=>{
			let x = {2:1, 1:-1};
			let result = calc(x);
			
			assert.toleranceEqual(result, 8, 'x[1]');
			
		});
	});
});
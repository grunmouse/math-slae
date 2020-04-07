let {
	onceInstances,
	group
} = require('../analyse.js');

const assert = require('assert');
const k = Math.SQRT2;
/*
	  P, 1, 2, 3, 4, 5, 6, 7, 8, 9,S1,S2	
	[ 0, 0, 1, k, 0, 0, 0, 0, 0, 0, 0, 0],
	[ 0,-1, 0,-k, 0, 0, 0, 0, 0, 0, 0, 0],
	[ 0, 0,-1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
	[-1,-1, 0, 0, 0,-1, 0, 0, 0, 0, 0, 0],
	[ 0, 0, 0, 0, 0, 0,-1,-k, 0, 0, 0, 0],
	[ 0, 0, 0, 0, 0, 0, 0,-k, 0,-1, 0, 0],
	[ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
	[ 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
	[ 0, 0, 0,-k,-1, 0, 0, k, 1, 0, 0, 0],
	[ 0, 0, 0, k, 0, 1, 0, k, 0, 0, 0, 0],
	[ 0, 0, 0, 0, 0, 0, 0, 0,-1, 0, 0, 0],
	[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1]


*/
describe('linear system analyse', ()=>{

	describe('group', ()=>{
		it('A', ()=>{
			let A = [
				[ 0, 0, 1, k, 0, 0, 0, 0, 0, 0, 0, 0],
				[ 0,-1, 0,-k, 0, 0, 0, 0, 0, 0, 0, 0]
			];
			
			let _A = group(A);
			
			assert.equal(_A.length, 1);
			assert.equal(_A[0].length, 2);
			assert.ok(_A[0].every(a=>(A.includes(a))));
		});
		
		it('B', ()=>{
			let A = [
				[ 0, 0,-1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
				[-1,-1, 0, 0, 0,-1, 0, 0, 0, 0, 0, 0]
			];
			
			let _A = group(A);
			
			assert.equal(_A.length, 2);
			assert.ok(_A.every(a=>(
				a.length===1 && A.includes(a[0])
			)));
		});
		
		it('case 1', ()=>{
			let A = [
				[ 0, 1, 0, -0 ],
				[ 1, 0, 1, -1 ],
				[ 0, 0, 4, 1 ]
			];
			let _A = group(A);
			
			assert.equal(_A.length, 2);
			assert.ok(_A.some(a=>(
				a.length===1 && a[0] == A[0]
			)));
		});
		
		it('case 2', ()=>{
			let A = [
				[ 1, 0, 0, -0, -0 ], 
				[ 0, 1, 1, -1, -1 ], 
				[ 0, 0, 2, -1, -2 ] 
			];
			
			let _A = group(A);
			assert.equal(_A.length, 2);
			assert.ok(_A.some(a=>(
				a.length===1 && a[0] == A[0]
			)));
		});
	});
	
	describe('onceInstances', ()=>{
		it('1', ()=>{
			let A = [
				[ 0, 0, 0,-k,-1, 0, 0, k, 1, 0, 0, 0],
				[ 0, 0, 0, k, 0, 1, 0, k, 0, 0, 0, 0]
			];
			
			let R = onceInstances(A);

			assert.deepEqual(R.B[0], [ 0, 0, 0, 0, -1, 0, 0, 0, 1, 0, 0, 0, -1, 0 ]);
			assert.equal(R.A[0][12], 1);
			assert.equal(R.A[0][4], 0);
			assert.equal(R.A[0][8], 0);

		});
		
		it('2', ()=>{
			let A = [
				[ 0, 1, 1, -1, -1 ], 
				[ 0, 0, 2, -1, -2 ] 
			];
			
			let R = onceInstances(A);
			
			console.log(R);
		});
	});

});
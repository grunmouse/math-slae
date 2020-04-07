/**
 * Возвращает функцию, решающую уравнение, заданное вектором A и левой частью b, относительно переменной target
 */
/**
 * @param {Array<number>} A
 * @param {number} b
 * @param {number} target
 * @return {Function<(Indexed<number>)=>(number)>}
 */
function lineEquation(A, b, target){
	let _A = A[target];
	if(_A === 0){
		throw new Error('coeff A is 0');
	}
	return (x)=>{
		let _b = A.reduce((akk, a, j)=>(target === j || a===0 ? akk : akk - x[j]*a), b);
		
		return _b/_A;
	}
}

module.exports = lineEquation;
const {SquareMatrix} = require('@grunmouse/math-matrix');

/**
 * Возвращает общее решение полной системы линейных уравнений, заданной квадратной матрицей коэффициентов A
 * @param {Array[m]<Array[m]<number>>} A - квадратная матрица коэффициентов, массив векторов-строк
 *
 * @returned {Function<(Array[m]<number>)=>(Array[m]<number>)>} - функция отображающая вектор правых частей на вектор переменных
 */
function lineSystem(A){
	//Составляет матрицу коэффициентов для неизвестных переменных
	let rA = A;
	
	let _A = new SquareMatrix(rA.length, [].concat(...rA));

	//_A*x = _b, где _A - квадратная матрица
	
	let invA = _A.inverse();


	/**
	 * @param _b {Array<number>} - массив правых частей уравнения
	 */
	return (_b)=>{
		
		//x = invA * _b;
		
		let _x = invA.mulCol(_b);
		
		return _x;
	};
}

function lineEquation(a){
	return (b)=>(b/a);
}

module.exports = {
	lineSystem,
	lineEquation
};


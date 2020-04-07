const {SquareMatrix} = require('@grunmouse/math-matrix');


/**
 * Возвращает общее решение системы линейных уравнений, заданной матрицей коэффициентов A и столбцом свободных членов b
 * относительно переменных target
 * @param {Array[m]<Array[n]<number>>} A - матрица коэффициентов, массив векторов-строк
 * @param {Array[m]<number>} b - столбец правых частей
 * @param {Array[m]<number>} target - массив номеров переменных, относительно которых решается система, остальные считаются известными
 *
 * @returned {Function<(Indexed<(number|undefined)>) => (Indexed<(number|undefined)>)}
 */
function lineSystem(A, b, target){
	//Составляет матрицу коэффициентов для неизвестных переменных
	let rA = A.map((A, i)=>target.map((j)=>A[j]));
	
	
	let _A = new SquareMatrix(rA.length, [].concat(...rA));

	//_A*x = _b, где _A - квадратная матрица
	
	let invA = _A.inverse();


	/**
	 * @param x {Indexed<number>} - массив или объект с числовыми ключами, содержащий значения известных переменных
	 *		нумерация переменных совпадает с нумерацией элементов в строках матрицы A
	 */
	return (x)=>{
		//Используем известные переменные, чтобы рассчитать новый столбец свободных членов
		let _b = b.map((b, i)=>(
			A[i].reduce((akk, a, j)=>(target.includes(j) || a===0 ? akk : akk - x[j]*a), b)
		));
		
		
		//x = invA * _b;
		
		let _x = invA.mulCol(_b);
		
		//Перенумеровываем переменные, чтобы их номера совпадали с таковыми в вызывающем коде
		return _x.reduce((akk, x, i)=>{
			akk[target[i]] = x;
			return akk;
		}, {});
	};
}


module.exports = lineSystem;


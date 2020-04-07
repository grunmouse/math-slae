let calc = require('@grunmosue/math-calc-scheme');
let independent = require('../independent');

let {lineEquation, lineSystem} = require('./equations.js');

/**
 * Создаёт граф расчётной схемы для системы линейных уравнений, заданной матрицей коэффициентов и столбцом левых частей.
 * В результате работы создаются узлы-калькуляторы и рёбра, соединяющие их с переменными, перечисленными vars
 * @param {Array[m]<Array[m]<number>>} A - матрица коэффициентов
 * @param {Array[m]<VarNode>} b - столбец правых частей
 * @param {Indexed<VarNode>} vars - массив узлов-переменных, соответствующих неизвестным уравнения
 * @return {Indexed<VarNode>} === vars
 */
function createCalcScheme(A, b, vars){
	if(A.length != b.length){
		throw new Error('Inconsictent A|b pair');
	}
	let _A = independent(A);
	
	if(_A.length < A.length){
		throw new Error('Invalid matrix');
	}
	
	let fun = lineSystem(_A);
	let name = _A.map((row, j)=>(row.map((a, i)=>(''+a+vars[i].name)).join(' + ') + ' = ' + b[j])).join(',\n') + ';';
	
	new calc.CalcNode(name, A.length, vars, b, ()=>(fun));
	return vars;
}


module.exports = {
	lineSystem,
	lineEquation, 
	createCalcScheme
}
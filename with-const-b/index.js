let calc = require('@grunmosue/math-calc-scheme');
let independent = require('../independent');
let {
	onceInstances,
	group,
	getB,
	getNoZeroColumn,
	getNoZero,
	
	getSubsystemForTarget
} = require('../analyse.js');

let lineEquation = require('./line-equation.js');
let lineSystem = require('./line-system.js');
let {
	cloneIndexed,
	select
} = require('../indexed.js');




/**
 * Выбирает из vars переменные, соответствующие ненулевым коэффициентам A,
 * складывает их в Map с сохранением индекса
 * @param {Indexed<VarNode>} vars
 * @param {Array<number>} A - массив коэффициентов
 * @return {Map<number, VarNode>}
 */
function setectNoZero(vars, A){
	return A.reduce((akk, value, index)=>{
		if(A[index]){
			akk.set(index, vars[index]);
		}
		return akk;
	}, new Map());
}

/**
 * Выбирает из vars переменные, соответствующие ненулевым столбцам матрицы A,
 * складывает их в Map с сохранением индекса
 * @param {Indexed<VarNode>} vars
 * @param {Array<Array[n]<number>>} A - матрица коэффициентов
 * @return {Map<number, VarNode>}
 */
function selectNoZeroColumn(vars, A){
	let target = getNoZeroColumn(A);
	return select(vars, target);
}



/**
 * Генерирует строку для отображения уравнения в интерфейсе
 * @param {Indexed<VarNode>} vars
 * @param {Array<number>} A - массив коэффициентов
 * @param {number} b - правая часть уравнения
 * @returned {string}
 */
function equationName(vars, A, b){
	let _vars = setectNoZero(vars, A);
	return [..._vars].map(([key, a])=>(a.name || key)).join(',')+'|'+b;
}

/**
 * Создаёт подграф расчётной схемы, реализующий решение независимого линейного уравнения
 * @param {Array<number>} A - массив коэффициентов
 * @param {number} b - левая часть
 * @param {Indexed<VarNode>} vars - массив узлов-переменных, соответствующих неизвестным уравнения
 * @return {CalcNode}
 */
function createForOneEq(A, b, vars){
	let _vars = setectNoZero(vars, A)
	if(b=== undefined){
		throw new Error('Right part value (b) is undefined');
	}
	let target = getNoZero(A);
	let name = target.map((i)=>(''+A[i]+vars[i].name)).join(' + ') + ' = ' + b + ';';
	//console.log({A, b, _vars});
	return new calc.CalcNode(name, 1, _vars, (key)=>(lineEquation(A, b, +key)));
}

/**
 * Создаёт подграф расчётной схемы, реализующий решение системы линейных уравнений
 * @param {Array[m]<Array[n]<number>>} A - матрица коэффициентов
 * @param {Array[m]<number>} b - столбец левых частей
 * @param {Indexed<VarNode>} vars - массив узлов-переменных, соответствующих неизвестным уравнения
 * @return {CalcNode}
 */
function createForSystem(A, b, vars){
	let target = getNoZeroColumn(A);
	let name = A.map((row, j)=>(target.map((i)=>(''+row[i]+vars[i].name)).join(' + ') + ' = ' + b[j])).join(',\n') + ';';
	
	let control = (set)=>{
		if(set.size <= A.length){
			//Расшифровываем расчётную схему
			let target = [...set].map((edge)=>(+edge.getKey())).sort();
			//Делаем выборку столбцов
			let rA = A.map((A, i)=>target.map((j)=>A[j]));
			//Находим наибольшую линейно независимую подсистему строк
			let _A = independent(rA);
			//проверяем найденную подсистему на квадратность
			return _A.length === target.length;
		}
		else{
			return false;
		}
	};
	
	let factory = (keys)=>{
		let target = keys.split(',').map((a)=>(+a));
		let sys;
		if(target.length<A.length){
			sys = getSubsystemForTarget(A, b, target);
		}
		else{
			sys = {A, b};
		}
		if(sys.A.length > 1){
			return lineSystem(sys.A, sys.b, target);
		}
		else{
			return lineEquation(sys.A[0], sys.b[0], target[0])
		}
	};
	
	return new calc.CalcNode(name, control, selectNoZeroColumn(vars, A), factory);
}



/**
 * Создаёт связный подграф расчётной схемы
 * В результате работы создаются узлы-калькуляторы и рёбра, соединяющие их с переменными, перечисленными vars
 * @param {Array[m]<Array[n]<number>>} A - матрица коэффициентов
 * @param {Array[m]<number>} b - столбец правых частей
 * @param {Indexed<VarNode>} vars - массив узлов-переменных, соответствующих неизвестным уравнения
 * @return {Indexed<VarNode>} === vars
 */
function createCalcSubsheme(A, b, vars){
	if(A.length === 1){
		createForOneEq(A[0], b[0], vars);
	}
	else{
		let R = onceInstances(A);

		let _vars = cloneIndexed(vars);
		R.B.forEach((B, index)=>{
			if(B){
				let noZero = getNoZero(B);
				//@var news - массив из единственной дополнительной переменной
				let news = noZero.filter(a=>(a>=R.len));
				if(news.length>1){
					throw new Error('Invalid extended row');
				}
				
				let i = news[0];
				_vars[i] = new calc.VarNode('B'+i+'_'+(Date.now()%1024));
				createForOneEq(B, 0, _vars);
			}
		});
		createForSystem(R.A, b, _vars);
	}
	return vars;
}
/**
 * Создаёт граф расчётной схемы для системы линейных уравнений, заданной матрицей коэффициентов и столбцом левых частей.
 * В результате работы создаются узлы-калькуляторы и рёбра, соединяющие их с переменными, перечисленными vars
 * @param {Array[m]<Array[n]<number>>} A - матрица коэффициентов
 * @param {(Array[m]<number>|number)} b - столбец правых частей или константа для всех правых частей
 * @param {Indexed<VarNode>} vars - массив узлов-переменных, соответствующих неизвестным уравнения
 * @return {Indexed<VarNode>} === vars
 */
function createCalcScheme(A, b, vars){
	if(typeof b === 'number'){
		b = Array(A.length).fill(b);
	}
	if(A.length != b.length){
		throw new Error('Inconsictent A|b pair');
	}
	let _A = independent(A);
	let g = group(_A);
	//console.log(g);
	for(let _A of g){
		let _b = getB(A, b, _A);
		
		createCalcSubsheme(_A, _b, vars);
	}
	return vars;
}


module.exports = {
	lineSystem,
	lineEquation,
	createCalcScheme
}
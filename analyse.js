const {MapOfSet} = require('@grunmouse/special-map');


/** 
 * Считает для каждого неизвестного количество уравнений, в которых оно участвует
 * @param {Array<Array[n]<number>>} A - массив векторов, содержащих коэффициенты уравнений
 * @returned {Array[n]<number>} - массив с подсчитанными количествами
 */
function varCount(A){
	let c = A[0].map((a)=>(+(a!=0)));
	for(let i = 1; i<A.length; ++i){
		A[i].forEach((a, i)=>{
			if(a!=0){
				++c[i];
			}
		});
	}
	return c;
}


/**
 * @void
 * Добавляет номера переменных из vars в очередь queue
 * @param {Array} queue
 * @param {Iterable} vars
 */
function queueVars(queue, vars){
	for(let v of vars){
		if(!queue.includes(v)){
			queue.push(v);
		}
	}
}

/**
 * @void
 * Перемещает значение a из набора from в набор into
 * @param {any} a
 * @param {Set} from
 * @param {Set} Into
 */
function move(a, from, into){
	from.delete(a);
	into.add(a);
}

/**
 * Группирует векторы A в системы, содержащие общие переменные
 * @param {Array<Array[n]<number>>} A - массив векторов, содержащих коэффициенты уравнений
 * @return {Array<Array<Array[n]<number>>>} - массив массивов векторов, связанных между собой общими переменными
 */
function group(A){
	
	/**
	 * @local
	 * @variable {MapOfSet} M
	 * Отображает каждый вектор A на набор номеров переменных, для которых он содержит ненулевые коэффициенты
	 * Отображает каждый номер столбца на набор векторов A, которые содержат в этом столбце ненулевые коэффициенты
	 * ~Map<(Item of A).(Set<number>) | (<number>).(Set<Item of A>)>
	 */
	let M = new MapOfSet();
	for(let row of A){
		for(let i = 0; i<row.length; ++i){
			if(row[i]!=0){
				M.add(i, row);
				M.add(row, i);
			}
		}
	}
	
	/**
	 * @local
	 * @variable {Set<Item of A>} all
	 */
	let all = new Set(A);
	
	/**
	 * @local
	 * @variable {Item of A} first
	 */
	let first = all[Symbol.iterator].next().value, result = [];
	while(first){
		//@var {Set<Item of A>} cur
		let cur = new Set();

		//@var {Array<number>} queue
		let queue = [...M.get(first)]; //M.get({Item of A})=>{Set<number>}
		
		move(first, all, cur); //
		
		for(let i=0; i<queue.length; ++i){
			let rows = M.get(queue[i]); //M.get({number})=>{Set<Item of A>}
			for(let row of rows){
				move(row, all, cur);
				queueVars(queue, M.get(row))
			}
		}
		result.push([...cur]);
		
		first = all[Symbol.iterator].next().value;
		
	}
	
	return result;
}

/**
 * Вводит дополнительные уравнения, такие, чтобы в каждом уравнении было не более одной уникальной переменной
 * @param {Array[m]<Array[n]<number>>} A - массив векторов, содержащих коэффициенты уравнений
 * @return object
 *		@property {Array[m]<Array[m+n]<number>>} A - массив векторов, содержащих коэффициенты расширенной системы уравнений
 *		@property {Array[m]<(Array[m+n]<number>|undefined)>} B - массив векторов, содержащих коэффициенты дополнительных уравнений
 *		@property {number} len === n - длина каждого вектора в исходном массиве A
 *		@property {number} count === m - количество векторов в массивах A
 */
function onceInstances(A){
	let c = varCount(A); //@var {Array[n]<number>} количество уравнений, для каждой переменной
	let B = [];
	let count = A.length, len = A[0].length;

	let R = A.map((a, i)=>{

		/**
		 * @local
		 * @var {Object} v
		 * @property {Array<number>} v.o - массив номеров переменных, эксклюзивных для этого уравнения
		 * @property {Array<number>} v.s - массив номеров неэксклюзивных переменных
		 */
		let v = a.reduce((r, a, i)=>{
			if(a!=0){
				if(c[i]===1){
					r.o.push(i);
				}
				else{
					r.s.push(i);
				}
			}
			return r;
			
		}, {s:[], o:[]});
		
		/**
		 * @local @var {Array[m+n]<number>} r - удлинённая строка
		 */
		let r = a.concat(Array(count).fill(0));
		if(v.o.length>1){
			/**
			 * @local @var {Array[m+n]<number>} b - строка для матрицы B
			 */
			let b = Array(count+len).fill(0);
			//Добавляем новую переменную с коэффициентом -1 в b и с коэффициентом 1 - в r
			b[len+i] = -1;
			r[len+i] = 1;
			for(let j of v.o){
				r[j] = 0;
				b[j] = a[j]
			}
			//b.index = len+i;
			B[i] = b;
		}
		return r;
	});
	return {A:R, B, len, count};

}


/**
 * Отбирает элементы вектора b, соответствующие строкам матрицы _A
 * @param {Array[m]<Array[n]<number>>} A - матрица коэффициентов
 * @param {Array[m]<T>} b - столбец левых частей
 * @param {Array[p]<Item of A>} _A - массив-выборка со строками из матрицы A
 * @returned {Array[p]<Item of b>}
 */
function getB(A, b, _A){
	return _A.map((a)=>{
		let index = A.indexOf(a);
		if(index == -1){
			throw new RangeError('Array item is not contained in source Array');
		}
		return b[index];
	});
}

/**
 * Находит номера ненулевых столбцов матрицы A
 * @param {Indexed<VarNode>} vars
 * @param {Array<Array[n]<number>>} A - матрица коэффициентов
 * @return {Array<number>}
 */
function getNoZeroColumn(A){
	let target = new Set();
	let len = A[0].length;
	for(let i= 0; i<len; ++i){
		for(let a of A){
			if(a[i]!==0){
				target.add(i);
				break;
			}
		}
	}

	target = [...target].sort();
	return target;
}

/**
 * Находит номера ненулевых значений в массиве A
 * @param {Array<number>} A - массив коэффициентов
 * @returned {Array<number>}
 */
function getNoZero(A){
	let target = new Set();
	A.forEach((a, i)=>{
		if(a!==0){
			target.add(i);
		}
	})
	return [...target].sort();
}

/**
 * Выбирает из системы подсистему уравнений, достаточную, для решения относительно меньшего количества переменных
 * @param {Array[m]<Array[n]<number>>} a
 * @param {Array[m]<number>} b
 * @param {Array[l]<number>} target
 * where l < m && target[i] < n
 */
function getSubsystemForTarget(A, b, target){
	let cols = new Set(target);
	let _A = A.filter((a)=>{
		for(let i of cols){
			if(a[i] != 0){
				cols.delete(i);
				return true;
			}
		}
		return false;
	});
	
	let _b = getB(A, b, _A);
	
	return {
		A:_A,
		b:_b
	}
}

module.exports = {
	/**
	 * @function onceInstances(A)
	 * Вводит дополнительные уравнения, такие, чтобы в каждом уравнении было не более одной уникальной переменной
	 * @param {Array[m]<Array[n]<number>>} A - массив векторов, содержащих коэффициенты уравнений
	 * @return object
	 *		@property {Array[m]<Array[m+n]<number>>} A - массив векторов, содержащих коэффициенты расширенной системы уравнений
	 *		@property {Array[m]<(Array[m+n]<number>|undefined)>} B - массив (с пропусками) векторов, содержащих коэффициенты дополнительных уравнений
	 *		@property {number} len === n - длина каждого вектора в исходном массиве A
	 *		@property {number} count === m - количество векторов в массивах A
	 */
	onceInstances,

	/**
	 * @function group(A)
	 * Группирует векторы A в системы, содержащие общие переменные
	 * @param {Array<Array[n]<number>>} A - массив векторов, содержащих коэффициенты уравнений
	 * @return {Array<Array<Array[n]<number>>>} - массив массивов векторов, связанных между собой общими переменными
	 */
	group,
	
	/**
	 * @function getB(A, b, _A)
	 * Отбирает элементы вектора b, соответствующие строкам матрицы _A
	 * @param {Array[m]<Array[n]<number>>} A - матрица коэффициентов
	 * @param {Array[m]<T>} b - столбец левых частей
	 * @param {Array[p]<Item of A>} _A - массив-выборка со строками из матрицы A
	 * @returned {Array[p]<Item of b>} - массив-выборка с элементами из массива b
	 */
	getB,
	
	/**
	 * @function getNoZeroColumn(A)
	 * Находит номера ненулевых столбцов матрицы A
	 * @param {Array<Array[n]<number>>} A - матрица коэффициентов
	 * @return {Array<number>}
	 */
	getNoZeroColumn,
	
	/**
	 * @function getNoZero(A)
	 * Находит номера ненулевых значений в массиве A
	 * @param {Array<number>} A - массив коэффициентов
	 * @returned {Array<number>}
	 */
	getNoZero,
	
	
	/**
	 * @function getSubsystemForTarget(A, b, target)
	 * Выбирает из системы подсистему уравнений, достаточную, для решения относительно меньшего количества переменных
	 * @param {Array[m]<Array[n]<number>>} a
	 * @param {Array[m]<number>} b
	 * @param {Array[l]<number>} target
	 * where l < m && target[i] < n
	 */
	getSubsystemForTarget
};


const {SquareMatrix} = require('@grunmouse/math-matrix');
const {TupleMap} = require('@grunmouse/tuple');

/**
 * Находит наибольшую линейно независимую систему векторов переданной системы
 * @param {Array<Array<number>>} A - система векторов, представленных массивами
 * @return {Array<Array<number>>} - выборка элементов A, являющаяся линейно независимой системой векторов
 */
function independent(A){
	const rowCount = A.length;
	const cashe = new TupleMap();
	/**
	 * @var result : Array<items of A> - найденная линейно независимая подсистема
	 *
	 * @var columns : Array<Number> - номера столбцов найденного ненулевого минора
	 * 
	 * @var row : Number - номер текущей проверяемой строки
	 */
	 
	let result;
	let columns;
	let row = 0;
	//Ищем первый ненулевой член матрицы
	for(; row<rowCount; ++row){
		//console.log(row, A[row]);
		let col = A[row].findIndex((a)=>(a!=0)); 
		if(~col){
			result = [A[row]];
			columns = [col];
			++row;
			break;
		}
	}
	//Если ни одного ненулевого члена не нашлось, значит на входе нулевая матрица
	if(!result){
		return [];
	}
	
	const colCount = result[0].length;
	
	forrow:for(; row<rowCount; ++row){
		/**
		 * @var sys : Array<items of A> - подсистема строк для проверки
		 */
		let sys = result.concat([A[row]]);
		let range = sys.length;
		
		forcol:for(let col = 0; col<colCount; ++col) if(!columns.includes(col)){
			/**
			 * @var cols : Array<items of A> - подсистема столбцов для построения окаймляющего минора
			 */
			let cols = columns.concat(col).sort();
			
			//Составляем окаймляющий минор
			let values = Array.from({length: range*range}, (_, index)=>{
				let col = index % range, row = Math.floor(index/range);
				return sys[p.row][cols[p.col]];
			});
			
			//Я добавляю строки сверху вниз, поэтому мне выгодно раскрывать по последней строке
			let d = new SquareMatrix(range, values).det(cashe, true);
			
			if(d != 0){
				//console.log(d, M);
				//Найден ненулевой минор
				//Добавляем строку в выборку и запоминаем столбцы минора
				result = sys;
				columns = cols;
				break forcol;
			}
		}
		//Если ненулевой минор найден, то result и cols обновлены, и новая итерация рассчитается с новым исходным минором
		//Если ненулевой минор не найден, то в следующей итерации попытка повторится со старыми result и cols, и новой строкой
		if(columns.length === colCount){
			//Если исчерпаны все столбцы, значит новой строки мы уже не найдём
			break forrow;
		}
	}
	
	return result;
}

module.exports = independent;
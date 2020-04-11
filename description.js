
/**
 * Генерирует LaTeX-код системы уравнений
 * @param A : Array<Array<(VarNode|Number)>> - матрица коэффициентов
 * @param x : Array<(VarNode)> - вектор переменных
 * @param b : Array<(VarNode|Number)> - вектор правых частей
 */
function description(A, x, b){
	let eq = A.map((a, i)=>{
		let items = a.map((a, j)=>{
			let sgn = '+';
			if(typeof a === 'number'){
				sgn = a < 0 ? '-' : sgn;
			}
			else{
				a = a.name;
			}
			
			return [sgn, a, x[j].name];
		}).filter((item)=>(item[1]!==0));
		
		if(items[0][0] === '+'){
			items[0][0] = '';
		}
		
		let eq = items.flat();
		let right = typeof b === 'number' ? b : b.name;
		eq.push('=', right);
		return eq.join('');
	}).join(',\\\\\n');
}

module.exports = description;
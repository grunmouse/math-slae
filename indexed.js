/**
 * @typedef {(Array<T>|Object<number,T>)} Indexed<T>
 */


/**
 * Клонирует значение типа Indexed
 * @param {Indexed<T>} a
 * @return {Indexed<T>}
 */
function cloneIndexed(a){
	if(Array.isArray(a)){
		return a.slice(0);
	}
	else{
		let result = {};
		for(let i in a){
			result[i] = a[i];
		}
		return result;
	}
}

/**
 * Выбирает из vars элементы, перечисленные в target, 
 * складывает их в Map с сохранением индекса
 * @param {Indexed<T>} vars
 * @param {Iterable<number>} target - массив номеров
 * @return {Map<number, T>}
 */
function select(vars, target){
	const akk = new Map();
	for(let index of target){
		akk.set(index, vars[index]);
	}
	return akk;
}



module.exports = {
	cloneIndexed,
	select
};
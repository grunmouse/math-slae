let calc = require('@rakov/math-calc-scheme');
let iterable = require('@rakov/iterable');

let withConstB = require('../index.js');
const {
	Abstract,
	Calculated,
	Setable,
	Stub
} = require('@rakov/variable'); 
const assert = require('assert');


describe('calc-sheme', ()=>{
	
	describe('flat farm', ()=>{
		/*
			Вид фермы:  		Обозначение стержней		Обозначение шарниров
			    P       						
			o---o---o  				 o-1-o-5-o				A---B---C
			|\  |  /|  				 |\  |  /|				|\  |  /|
			| \ | / |  				 0 2 4 6 8				| \ | / |
			|  \|/  |  				 |  \|/  |				|  \|/  |
			o---o---o  				 o-3-o-7-o				D---E---F
			S1      S2  
			P - нагрузка, действующая сверху вниз, S1 и S2 - реакции опоры.
			Все внешние силы приложены к шарнирам.
		*/
		
		/*
			Номера переменных:
			Величина P - 0,
			Силы растяжения стержней - по номеру стержня,
			Силы реакции опоры: S1 - 10, S2 - 11
		*/
		const k = Math.SQRT2;
		
		const rods = {
			A:{
				A:[
				/*	 P, 1, 2, 3, 4, 5, 6, 7, 8, 9,S1,S2	*/
					[0, 0, 1, k, 0, 0, 0, 0, 0, 0, 0, 0],
					[0,-1, 0,-k, 0, 0, 0, 0, 0, 0, 0, 0]
				],
				b:[0,0]
			},
			B:{
				A:[
				/*	  P, 1, 2, 3, 4, 5, 6, 7, 8, 9,S1,S2	*/
					[ 0, 0,-1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
					[-1, 0, 0, 0, 0,-1, 0, 0, 0, 0, 0, 0]
				],
				b:[0,0]
			},
			C:{
				A:[
				/*	 P, 1, 2, 3, 4, 5, 6, 7, 8, 9,S1,S2	*/
					[0, 0, 0, 0, 0, 0,-1,-k, 0, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0,-k, 0,-1, 0, 0]
				],
				b:[0,0]
			},
			D:{
				A:[
				/*	 P, 1, 2, 3, 4, 5, 6, 7, 8, 9,S1,S2	*/
					[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
					[0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]
				],
				b:[0,0]
			},
			E:{
				A:[
				/*	 P, 1, 2, 3, 4, 5, 6, 7, 8, 9,S1,S2	*/
					[0, 0, 0,-k,-1, 0, 0, k, 1, 0, 0, 0],
					[0, 0, 0, k, 0, 1, 0, k, 0, 0, 0, 0]
				],
				b:[0,0]
			},
			F:{
				A:[
				/*	 P, 1, 2, 3, 4, 5, 6, 7, 8, 9,S1,S2	*/
					[0, 0, 0, 0, 0, 0, 0, 0,-1, 0, 0, 0],
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1]
				],
				b:[0,0]
			}
		};
		
		function testRod(rod){
			let A = rod.A;
			let b = rod.b;
			let vars = calc.manyVarNodes(['P', 0, 1, 2, 3, 4, 5, 6, 7, 8, 'S1', 'S2']);
			
			withConstB.createCalcScheme(A, b, vars);
			
			let g = calc.getAllGraph(vars);
			
			let used = g.filter((g)=>(g.edges.size>0));
			
			return {vars, g, used};
		}
		
		const calcNodes = graph => [...graph.nodes].filter(a=>(a instanceof calc.CalcNode));
		
		function consoleGraph(g, used){
			console.log('digraph c{');

			for(let _g of g){
				for(let e of _g.edges){
					if(!used || e.isUsed){
						console.log(e.toDOT());
					}
				}
			}
			console.log('}');
		}
		
		describe('rod A', ()=>{
			
			let {vars, g, used} = testRod(rods.A);
			
			it('subgraph count', ()=>{
				assert.equal(used.length, 1); //Найден один рабочий подграф
			});
			
			let c = calcNodes(used[0]);
			
			it('calcnodes', ()=>{
				assert.equal(c.length, 1); //В этом подграфе только один вычисляющий узел
			});
			
			it('edges', ()=>{
				//Каждое ребро подграфа соединяет одну из заданных переменных с единственным найденным калькулятором
				for(let e of used[0].edges){
					assert.equal(e.calculator, c[0]);
					assert.ok(vars.includes(e.variable));
				}
			});
			

		});

		describe('rod B', ()=>{
			
			let {vars, g, used} = testRod(rods.B);
			
			it('subgraph count', ()=>{
				assert.equal(used.length, 2);
			});
			
			let c = used.map(calcNodes);
			
			it('calcnodes', ()=>{
				//В каждом подграфе есть единственный вычисляющий узел
				assert.equal(c.length, 2);
				for(let s of c){
					assert.equal(s.length, 1);
				}
			});
			
			it('vars', ()=>{
				//Граф полностью распался на два подграфа, каждая переменная связана со своим отдельным вычисляющим узлом
				vars.forEach((varnode)=>{
					if(varnode.edges.size>0){
						assert.equal(varnode.edges.size, 1);
					}
				});
			});
			
			let P = new Setable();
			vars[0].asSource(P);
			
			let v = calc.createVariables(g[0]);
			P.set(150);
			it('calculate', ()=>{
				assert.equal(v.bynode.get(vars[0]).get(), 150);
				assert.equal(v.bynode.get(vars[5]).get(), -150);
			});	
		});
		
		describe('rod С', ()=>{
			
			let {vars, g, used} = testRod(rods.C);
			
			it('subgraph count', ()=>{
				assert.equal(used.length, 1);
			});
			
			let c = used.map(calcNodes);
			
			it('calcnodes', ()=>{
				//В каждом подграфе есть единственный вычисляющий узел
				assert.equal(c.length, 1, 'used count');
				for(let s of c){
					assert.equal(s.length, 1, 'varcalc count');
				}
			});
			
			//consoleGraph(used);

		});		
		
		describe('rod D', ()=>{
			
			let {vars, g, used} = testRod(rods.D);
			//Граф распался на два
			it('subgraph count', ()=>{
				assert.equal(used.length, 2);
			});
			
			let c = used.map(calcNodes);
			
			it('calcnodes', ()=>{
				//В каждом подграфе есть единственный вычисляющий узел
				assert.equal(c.length, 2);
				for(let s of c){
					assert.equal(s.length, 1);
				}
			});
			
			
			let F3 = vars.find((a)=>(a.name=='3'));
			it('constant calc', ()=>{
				assert.equal(F3.edges.size, 1);
				let e = iterable.getFirst(F3.edges);
				let c = e.calculator;
				assert.equal(c.edges.size, 1);
			});
			
			//consoleGraph(used);

		});
		
		describe('rod E', ()=>{
			let {vars, g, used} = testRod(rods.E);
			//Только один рабочий подграф
			it('subgraph count', ()=>{
				assert.equal(used.length, 1);
			});
			
			let c = calcNodes(used[0]);
			
			it('calcnodes', ()=>{
				assert.equal(c.length, 2); //В этом подграфе два вычисляющих узла
			});
			
			//consoleGraph(used);
		});
		
		describe('rod F', ()=>{
			
			let {vars, g, used} = testRod(rods.F);
			//Граф распался на два
			it('subgraph count', ()=>{
				assert.equal(used.length, 2);
			});
			
			let c = used.map(calcNodes);
			
			it('calcnodes', ()=>{
				//В каждом подграфе есть единственный вычисляющий узел
				assert.equal(c.length, 2);
				for(let s of c){
					assert.equal(s.length, 1);
				}
			});
			
			
			let F7 = vars.find((a)=>(a.name=='7'));
			it('constant calc', ()=>{
				assert.equal(F7.edges.size, 1);
				let e = iterable.getFirst(F7.edges);
				let c = e.calculator;
				assert.equal(c.edges.size, 1);
			});
			
			//consoleGraph(used);

		});
		
		describe('join rods system', ()=>{
			let vars = calc.manyVarNodes(['P', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'S1', 'S2']);
			
			[rods.A, rods.B, rods.C, rods.D, rods.E, rods.F].forEach(({A, b})=>withConstB.createCalcScheme(A, b, vars));
			
			let g = calc.getAllGraph(vars);
			for(let v of g[0].nodes){
				console.log(v.name);
			}
			it('count', ()=>{
				assert.equal(g.length, 1);
			});
			let P = new Setable();
			vars[0].asSource(P);
			
			let v = calc.createVariables(g[0]);
			
			P.set(150);
			
			it('calculate', ()=>{
				assert.deepEqual(vars.map((a)=>(v.bynode.get(a).get())), [150,-75,-75,53.03300858899106,0,-150,-75,53.03300858899106,0,-75,75,75]);
			});			
			
		});
		
		describe('full system', ()=>{
			let A = [], b = [];
			[rods.A, rods.B, rods.C, rods.D, rods.E, rods.F].forEach((rod)=>{
				A.push(...rod.A);
				b.push(...rod.b);
			});
			let vars = calc.manyVarNodes(['P', 1, 2, 3, 4, 5, 6, 7, 8, 9, 'S1', 'S2']);
			withConstB.createCalcScheme(A, b, vars)
			
			let g = calc.getAllGraph(vars);
			
			it('count', ()=>{
				assert.equal(g.length, 1);
			});
			it('calcNode', ()=>{
				let ca = [...g[0].nodes].filter(a=>(a instanceof calc.CalcNode));
				assert.equal(ca.length, 1);
			});
			//consoleGraph(g, true);
			
			let P = new Setable();
			vars[0].asSource(P);

			let v = calc.createVariables(g[0]);
			
			
			it('variables', ()=>{
				assert.equal(v.bynode.get(vars[0]), P);
			});
			
			P.set(150);

			it('calculate', ()=>{
				assert.deepEqual(vars.map((a)=>(v.bynode.get(a).get())), [150,-75,-75,53.03300858899106,0,-150,-75,53.03300858899106,0,-75,75,75]);
			});
			
		});
	});
	describe('system for part vars', ()=>{
		let A = [
			[1, -1, 1, 0],
			[0, -2, 2, 1]
		], 
		b = [0,0];
		
		describe('for 0,1', ()=>{
			let vars = calc.manyVarNodes(4);
			withConstB.createCalcScheme(A, b, vars);
			let g = calc.getAllGraph(vars);
			
			let x2 = new Setable(), x3 = new Setable();
			
			vars[2].asSource(x2);
			vars[3].asSource(x3);
			
			let v = calc.createVariables(g[0]);
			let x0 = v.bynode.get(vars[0]);
			let x1 = v.bynode.get(vars[1]);
			
			it('calc', ()=>{
				x2.set(1);
				x3.set(2);
				assert.equal(x0.get(), 1);
				assert.equal(x1.get(), 2);
			});
		});
		describe('for 2,3', ()=>{
			let vars = calc.manyVarNodes(4);
			withConstB.createCalcScheme(A, b, vars);
			let g = calc.getAllGraph(vars);
			
			let x0 = new Setable(), x1 = new Setable();
			
			vars[0].asSource(x0);
			vars[1].asSource(x1);
			
			let v = calc.createVariables(g[0]);
			let x2 = v.bynode.get(vars[2]);
			let x3 = v.bynode.get(vars[3]);
			
			it('calc', ()=>{
				x0.set(1);
				x1.set(2);
				assert.equal(x2.get(), 1);
				assert.equal(x3.get(), 2);
			});
		});
		describe('for 1,2', ()=>{
			let vars = calc.manyVarNodes(4);
			withConstB.createCalcScheme(A, b, vars);
			let g = calc.getAllGraph(vars);
			
			let x0 = new Setable(), x3 = new Setable();
			
			vars[0].asSource(x0);
			vars[3].asSource(x3);
			
			it('control', ()=>{
				assert.ok(!vars[1].known);
				assert.ok(!vars[2].known);
			});
		});
		describe('for 1', ()=>{
			let vars = calc.manyVarNodes(4);
			withConstB.createCalcScheme(A, b, vars);
			let g = calc.getAllGraph(vars);
			
			let x0 = new Setable(), x2 = new Setable(), x3 = new Setable();
			
			vars[0].asSource(x0);
			vars[3].asSource(x3);
			vars[2].asSource(x2);
			
			it('control', ()=>{
				assert.ok(vars[1].known);
			});
			it('calc', ()=>{
				let v = calc.createVariables(g[0]);
				let x1 = v.bynode.get(vars[1]);
				x0.set(1);
				x2.set(1);
				x3.set(2);
				assert.equal(x1.get(), 2);
			});
		});
		
	});

});
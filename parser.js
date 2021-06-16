class Grammar {
	constructor(terminals, variables, startSymbol, productions) {
		this.terminals = terminals;
		this.variables = variables;
		this.startSymbol = startSymbol; // non-terminal
		this.productions = productions
	}

	getProduction(variable) {
		for(let production of this.productions)
			if(production.head === variable)
				return production
	}

	isTerminal(symbol) {
		return (this.terminals.indexOf(symbol) !== -1)
	}

	isVariable(symbol){
		for(let variable of this.variables)
			if(variable.character === symbol)
				return true
		return false
	}

	isStartSymbol(symbol) {
		return (symbol === this.startSymbol.character)
	}


	follow(symbol) {
		let follow_set = new Array();
		if(this.isStartSymbol(symbol))
			follow_set.push("$");
		let regex_aBb = new RegExp(".+? " + symbol + "(?<beta> (.+)|$)")
		this.productions.forEach((obj_production) => {
			let production = obj_production.getBodyString();
			production.forEach((subproduction) => {
				let matches = subproduction.match(regex_aBb)
				if(matches === null) return

				let beta = matches["groups"].beta;
				let beta_parts = beta.split(/ +/);
				if(beta === '') {
					if(obj_production.head !== symbol) {
						let follow_sub = this.follow(obj_production.head);
						follow_set.push(... follow_sub);
					}
				} else {
					beta_parts.forEach((part) => {
						if(part === '') return;
						let first = this.first(part);
						let epsilon_pos = first.indexOf("e");
						if(epsilon_pos !== -1) {
							first.splice(epsilon_pos, 1);
							follow_set.push(... this.follow(part))			
						}
						follow_set.push(... first);
					});
				}
			});
		});
		return follow_set;
	}

	first(symbol) {
		let first_set = new Array();
		if(this.isTerminal(symbol))
			first_set.push(symbol)
		else {
			let productions = this.getProduction(symbol)
			let body_symbols = productions.getBodyArray()
			body_symbols.forEach((symbol) => {
				let isAllVariable = symbol.every((value) => {
					return this.isVariable(value)
				});

				if(!isAllVariable && this.isTerminal(symbol[0]))
					first_set.push(symbol[0])
				else if(symbol[0] === "e")
					first_set.push("e")
				else if(isAllVariable) {
					for(let part of symbol) {
						let other_first = this.first(part)
						first_set.push(... other_first)
						if(other_first.indexOf('e') === -1)
							break
					}
				}
			});
		}
		return first_set;
	}
}

class Variable {
	constructor(character) {
		this.character = character
	}
}

class Production {
	constructor(head, ...body) {
		this.head = head; // variavel
		this.body = body; // zero or more terminal and non-terminals
	}

	getBodyString() {
		return this.body;
	}

	getBodyArray() {
		let array_parts = new Array()
		for(let item of this.body)
			array_parts.push(item.split(/ +/))
		return array_parts
	}

	isProduction(prod) {
		for(let item of this.body)
			if(item === prod)
				return true
		return false
	}

	toString() {
		return this.head + " --> " + this.body;
	}
}



terminals = ["+", "*", "(", ")", "id"]; // e????
variables = [
	new Variable("E"),
	new Variable("E'"),
	new Variable("T"),
	new Variable("T'"),
	new Variable("F")
];
startSymbol = variables[0];

productions = [
	new Production("E", "T E'"),
	new Production("E'", "+ T E'", "e"),
	new Production("T", "F T'"),
	new Production("T'", "* F T'", "e"),
	new Production("F", "( E )", "id"),
];

grammar = new Grammar(terminals, variables, startSymbol, productions)

variables.forEach((item) => {
	console.log(item.character, grammar.follow(item.character))
});
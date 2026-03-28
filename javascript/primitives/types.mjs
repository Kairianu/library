export function getArrayValues() {
	return {
		'Primitive Array': [],
		'Primitive Array (Arg)': ['Primitive Array (Arg)'],
		'Array Constructor': new Array(),
		'Array Constructor (Sized)': new Array(1),
		'Array Constructor (Arg)': new Array('Array Constructor (Arg)'),
	};
}

export function getBigIntValues() {
	const millidigitString = '1234567890'.repeat(1000);

	return {
		'BigInt (Zero)': 0n,
		'BigInt (Positive)': 1n,
		'BigInt (Negative)': -1n,
		'BigInt (Millidigit Positive)': BigInt(millidigitString),
		'BigInt (Millidigit Negative)': BigInt('-' + millidigitString),
	};
}

export function getBooleanValues() {
	return {
		'Primitive Boolean (true)': true,
		'Primitive Boolean (false)': false,
		'Boolean Constructor': new Boolean(),
		'Boolean Constructor (true)': new Boolean(true),
		'Boolean Constructor (false)': new Boolean(false),
	};
}

export function getEmptyValues() {
	return {
		'undefined': undefined,
		'null': null,
	};
}

export function getFunctionValues() {
	return {
		'Standard Function': function() { return 'Standard Function' },
		'Standard Asynchronous Function': async function() { return 'Standard Asynchronous Function' },
		'Arrow Function': () => 'Arrow Function',
		'Arrow Asynchronous Function': async () => 'Arrow Asynchronous Function',
		'Function Constructor': new Function('return "Function Constructor"'),
	};
}

export function getNumberValues() {
	return {
		'Primitive Number (Zero)': 0,
		'Primitive Number (Positive)': 1,
		'Primitive Number (Negative)': -1,
		'Primitive Float Number (Positive)': 0.1,
		'Primitive Float Number (Negative)': -0.1,
		'Max Safe Integer': Number.MAX_SAFE_INTEGER,
		'Min Safe Integer': Number.MIN_SAFE_INTEGER,
		'Max Number Value': Number.MAX_VALUE,
		'Min Number Value': Number.MIN_VALUE,
		'Number Constructor': new Number(),
		'Number Constructor (Zero)': new Number(0),
		'Number Constructor (Positive)': new Number(1),
		'Number Constructor (Negative)': new Number(-1),
		'NaN': NaN,
		'Infinity': Infinity,
		'Negative Infinity': -Infinity,
	};
}

export function getObjectValues() {
	return {
		'Primitive Object': {},
		'Object Constructor': new Object(),
	};
}

export function getStringValues() {
	return {
		'Primitive String (Empty)': '',
		'Primitive String (Filled)': 'Primitive String (Filled)',
		'String Constructor': new String(),
		'String Constructor (Arg)': new String('String Constructor (Arg)'),
	};
}



export function getAllTestValues() {
	return Object.assign(
		{},

		getEmptyValues(),

		getBooleanValues(),

		getNumberValues(),
		getBigIntValues(),

		getStringValues(),

		getObjectValues(),
		getArrayValues(),

		getFunctionValues(),
	);
}



export function testAllValues(callback) {
	if ( typeof(callback) != 'function' ) {
		throw new TypeError('Argument <callback> must be of type "function"');
	}

	const allTestValues = getAllTestValues();

	for ( const [valueName, value] of Object.entries(allTestValues) ) {
		callback(value, valueName);
	}
}



if ( import.meta.main ) {
	const separator = '-'.repeat(50);
	const spacePrefix = ' '.repeat(3);

	testAllValues((value, valueName) => {
		console.log(
			`%c${valueName}`,
			'color: #b70'
		);

		console.log(
			`${spacePrefix}%cConstructor:  %c${value?.constructor?.name}`,
			'color: gray',
			'color: #b7b'
		);

		console.log(
			`${spacePrefix}%c       Type:  %c${typeof(value)}`,
			'color: gray',
			'color: #0b7'
		);

		console.log(
			`${spacePrefix}%c      Value: `,
			'color: gray',
			value
		);

		console.log(
			`%c${separator}`,
			'color: #aaa'
		);
	});
}

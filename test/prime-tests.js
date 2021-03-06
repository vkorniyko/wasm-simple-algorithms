var requireHelper = require("./_require_helper");
var isPrime = requireHelper('../source/prime/prime').isPrime;
var sieve = requireHelper('../source/prime/prime').sieve;
var readFileSync = require('fs').readFileSync;
var resolve = require('path').resolve;
var wasmSource = new WebAssembly.Module(readFileSync(resolve() + "/source/prime/prime.wasm"));
var primeNumbers = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

QUnit.test("JS isPrime test", function (assert) {
	for(var number = 0; number < 100; ++number)
		assert.strictEqual(isPrime(number), primeNumbers.includes(number));
});

QUnit.test("WASM isPrime test", function (assert) {
	var importObject = {
		env: {
			memory: new WebAssembly.Memory({ initial: 1 })
		}
	};

	var wasmModule = new WebAssembly.Instance(wasmSource, importObject);

	for(var number = 0; number < 100; ++number)
		assert.equal(wasmModule.exports.isPrime(number), primeNumbers.includes(number));
});

QUnit.test("JS sieve test", function (assert) {
	var range = sieve(100);

	for(var number = 0; number < 100; ++number)
		assert.strictEqual(range[number], primeNumbers.includes(number));
});

QUnit.test("WASM sieve test", function (assert) {
	var importObject = {
		env: {
			memory: new WebAssembly.Memory({ initial: 1 })
		}
	};

	var wasmModule = new WebAssembly.Instance(wasmSource, importObject);
	var wasmMemoryI8Array = new Int8Array(importObject.env.memory.buffer);

	wasmModule.exports.sieve(100);
	
	let range = [];

	for(let i = 0; i < 100; ++i)
		range.push(wasmMemoryI8Array[i]);

	for(var number = 0; number < 100; ++number)
		assert.equal(range[number], primeNumbers.includes(number));
});
import { describe, expect, test } from 'vitest';
import { determineChipValues } from './determineDenominations';

describe('determineDenominations', () => {
	test('Test 1', () => {
		const smallBlind = 0.25;
		const bigBlind = 0.5;
		const chipIds = ['white', 'red', 'blue', 'green', 'black'];
		const expected = {
			white: 0.25,
			red: 1,
			blue: 5,
			green: 25,
			black: 100
		};

		const actual = determineChipValues({ smallBlind, bigBlind, chipIds });

		expect(actual).toEqual(expected);
	});
	test('Test 2', () => {
		const smallBlind = 0.1;
		const bigBlind = 0.25;
		const chipIds = ['white', 'red', 'blue', 'green', 'black'];
		const expected = {
			white: 0.1,
			red: 0.25,
			blue: 1,
			green: 5,
			black: 25
		};

		const actual = determineChipValues({ smallBlind, bigBlind, chipIds });

		expect(actual).toEqual(expected);
	});
	test('Test 3', () => {
		const fn = () =>
			determineChipValues({ smallBlind: 0.123, bigBlind: 0.456, chipIds: ['a', 'b', 'c'] });
		expect(fn).toThrow();
	});
});

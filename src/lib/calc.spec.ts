import { describe, expect, test } from 'vitest';
import { calc } from './calc';

describe('calc', () => {
	test('Test 1', () => {
		const actual = calc({
			numPlayers: 8,
			stackValue: 20,
			bankReserve: 0.9,
			targetStackCount: 60,
			bank: {
				white: { value: 0.25, count: 150 },
				red: { value: 1, count: 150 },
				blue: { value: 5, count: 100 }
			}
		});
	});
});

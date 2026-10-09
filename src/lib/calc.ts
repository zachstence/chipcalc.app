export type CalcArgs = {
	numPlayers: number;
	stackValue: number;
	/** [0,1) */
	bankReserve: number;
	bank: ChipCollection;
	targetStackCount: number;
};

type ChipCollection = { [chipId: string]: { value: number; count: number } };

// !!!!!!!!!! Perhaps we could use some kind of ChipCollection data structure that will abstract away this sorting and exchanging of chips for both the bank and the player stack?
// Only tough part is handling unknown vs known chip values both in logic and in types...

// class ChipCollection {
//   /** Sorted by increasing value and decreasing count */
//   #sortedChipIds: string[]
//
//   #chipsById: { [chipId: string]: { readonly value: number; count: number } }
//
//   constructor(chips: { [chipId: string]: { value: number; count: number } }) {
//     this.#chipsById = Object.fromEntries(Object.entries(chips).map(([chipId, { value, count }]) => [chipId, { value, count }]))
//     this.#sortedChipIds = Object.entries(chips).sort(([_, { value: valueA, count: countA }], [__, { value: valueB, count: countB }]) => {
//       if (countA > countB) return -1
//       if (countA === countB && valueA < valueB) return -1
//     return 1
//     }).map(([chipId]) => chipId)
//   }
//
//
// }

// before calling this function, determine chip values and save on bank arg
// // Stage 1: compute chip values based on blinds
// const stack: ChipStack = bank.map((chip) => ({
//   chipId: chip.chipId,
//   value: chipValues[chip.chipId],
//   count: 0
// }));

/*
 *
 *
 * TODO split chip values from chip counts
 * This function only changes/determines counts, never values
 *
 *
 */

export const calc = ({
	numPlayers,
	stackValue,
	bankReserve,
	bank,
	targetStackCount
}: CalcArgs): { [chipId: string]: number } => {
	/** Sorted by increasing value and decreasing count */
	const sortedChipIds = Object.entries(bank)
		.sort(([_, { value: valueA, count: countA }], [__, { value: valueB, count: countB }]) => {
			if (countA > countB) return -1;
			if (countA === countB && valueA < valueB) return -1;
			return 1;
		})
		.map(([chipId]) => chipId);

	const remainingBankPerPlayer: { [chipId: string]: number } = Object.fromEntries(
		sortedChipIds.map(
			(chipId) =>
				[chipId, Math.floor((bank[chipId].count * bankReserve) / numPlayers)] as [string, number]
		)
	);
	console.log('start', { remainingBankPerPlayer });

	const stack = Object.fromEntries(
		Object.entries(bank).map(([chipId, { value }]) => [chipId, { value, count: 0 }])
	);

	// Stage 2: greedily provide each player high value chips
	for (const chipId of [...sortedChipIds].reverse()) {
		const chipValue = bank[chipId].value;
		const currentStackValue = Object.values(stack).reduce<number>(
			(stackValue, { value, count }) => stackValue + value * count,
			0
		);
		const remainingValue = stackValue - currentStackValue;
		const idealChipCount = Math.floor(remainingValue / chipValue);
		const availableChipCount = Math.floor((bank[chipId].count * bankReserve) / numPlayers);
		const chipCount = Math.min(idealChipCount, availableChipCount);
		stack[chipId].count += chipCount;
		remainingBankPerPlayer[chipId] -= chipCount;
	}
	console.log({ remainingBank: remainingBankPerPlayer, stack });

	console.log('\n===== STAGE 3 =====\n');

	// Stage 3: color down as much as possible
	const MAX_ITERS = 100;
	for (let i = 0; i < MAX_ITERS; i++) {
		console.log({ stack });
		const _shouldExchange = shouldExchange(sortedChipIds, stack);
		if (_shouldExchange) {
			const { exchangeFromChipId, exchangeToChipId } = _shouldExchange;
			console.log('should exchange 1', { from: exchangeFromChipId, to: exchangeToChipId });
			const exchanged = exchange({
				remainingBankPerPlayer,
				player: stack,
				exchangeFromChipId,
				exchangeToChipId
			});
			console.log({ exchanged });
			if (exchanged) continue;
		}
		console.log('pyramid achieved');

		const stackCount = Object.values(stack).reduce<number>(
			(stackCount, { count }) => stackCount + count,
			0
		);
		console.log({ stackCount, targetStackCount });
		if (stackCount >= targetStackCount) break;
		console.log('target stack count not reached yet', sortedChipIds);
		let exchanged2 = false;
		for (let i = sortedChipIds.length - 1; i > 0; i--) {
			if (exchanged2) break;
			console.log('trying to exchange', { from: sortedChipIds[i], to: sortedChipIds[i - 1] });
			exchanged2 = exchange({
				remainingBankPerPlayer,
				player: stack,
				exchangeFromChipId: sortedChipIds[i],
				exchangeToChipId: sortedChipIds[i - 1]
			});
			if (exchanged2) {
				console.log('exchanged');
			}
		}
		if (!exchanged2) break;
	}

	console.log('done', { stack });

	return Object.fromEntries(Object.entries(stack).map(([chipId, { count }]) => [chipId, count]));
};

/**
 * Modifies `remainingBankPerPlayer` and `player` chips to perform the exchange.
 * @returns {boolean} True if the exchange happened, false if there wasn't enough remaining chips in the bank to perform the exchange
 */
const exchange = ({
	remainingBankPerPlayer,
	player,
	exchangeFromChipId,
	exchangeToChipId
}: {
	remainingBankPerPlayer: { [chipId: string]: number };
	player: ChipCollection;
	exchangeFromChipId: string;
	exchangeToChipId: string;
}): boolean => {
	const exchangeFromValue = player[exchangeFromChipId].value;
	const exchangeToValue = player[exchangeToChipId].value;

	let exchangeFromCount: number;
	let exchangeToCount: number;
	if (exchangeFromValue > exchangeToValue) {
		exchangeFromCount = 1;
		exchangeToCount = exchangeFromValue / exchangeToValue;
	} else {
		exchangeFromCount = exchangeToValue / exchangeFromValue;
		exchangeToCount = 1;
	}

	if (exchangeToCount > remainingBankPerPlayer[exchangeToChipId]) return false;
	if (exchangeFromCount > player[exchangeFromChipId].count) return false;

	remainingBankPerPlayer[exchangeFromChipId] += exchangeFromCount;
	player[exchangeFromChipId].count -= exchangeFromCount;

	remainingBankPerPlayer[exchangeToChipId] -= exchangeToCount;
	player[exchangeToChipId].count += exchangeToCount;

	return true;
};

const shouldExchange = (
	sortedChipIds: string[],
	stack: ChipCollection
): false | { exchangeFromChipId: string; exchangeToChipId: string } => {
	for (let i = sortedChipIds.length - 1; i > 0; i--) {
		const lowerValueChipId = sortedChipIds[i - 1]!;
		const lowerValueChipCount = stack[lowerValueChipId]!.count;
		const higherValueChipId = sortedChipIds[i]!;
		const higherValueChipCount = stack[higherValueChipId]!.count;
		if (higherValueChipCount > lowerValueChipCount) {
			return {
				exchangeFromChipId: higherValueChipId,
				exchangeToChipId: lowerValueChipId
			};
		}
	}
	return false;
};

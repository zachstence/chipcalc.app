export type DetermineChipValuesArgs = {
	smallBlind: number;
	bigBlind: number;
	chipIds: string[];
};

export type DetermineChipValuesReturn = { [chipId: string]: number };

/**
 * Smallest chip value should be equal to smallBlind
 * If bigBlind is not a multiple of smallBlind, second smallest chip value should be equal to bigBlind
 */

export const determineChipValues = ({
	smallBlind,
	bigBlind,
	chipIds
}: DetermineChipValuesArgs): DetermineChipValuesReturn => {
	const values: { [chipId: string]: number } = {};

	for (let i = 0; i < chipIds.length; i++) {
		if (i === 0) {
			values[chipIds[i]!] = smallBlind;
		} else if (i === 1 && bigBlind % smallBlind !== 0) {
			values[chipIds[i]!] = bigBlind;
		} else {
			const prevValue = values[chipIds[i - 1]!]!;
			const multiplier = getMultiplier(prevValue);
			if (multiplier === undefined) throw new Error(`Invalid chip value: ${prevValue}`);
			values[chipIds[i]!] = prevValue * multiplier;
		}
	}

	return values;
};

const getMultiplier = (value: number): 4 | 5 | undefined => {
	const normalized = Number((value / 10 ** Math.floor(Math.log10(value))).toFixed(1));
	if (normalized === 2.5) return 4;
	if (normalized === 1 || normalized === 2 || normalized === 5) return 5;
	return undefined;
};

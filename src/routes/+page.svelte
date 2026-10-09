<script lang="ts">
	import { calc } from '#lib/calc.ts';
	import { determineChipValues } from '#lib/determineChipValues.ts';

	type Chip = {
		id: string;
		count: number;
	};

	const chips: Chip[] = $state([
		{ id: 'white', count: 150 },
		{ id: 'red', count: 150 },
		{ id: 'blue', count: 100 },
		{ id: 'green', count: 50 },
		{ id: 'black', count: 50 }
	]);

	let smallBlind: number = $state(0.25);

	let bigBlind: number = $state(0.5);

	const chipValues = $derived(
		determineChipValues({
			smallBlind,
			bigBlind,
			chipIds: chips.map((c) => c.id)
		})
	);

	let numPlayers: number = $state(11);
	let stackValue: number = $state(25);
	let bankReserve: number = $state(0.9);
	let targetStackCount: number = $state(30);

	const stack = $derived(
		calc({
			numPlayers,
			stackValue,
			bankReserve,
			targetStackCount,
			bank: Object.fromEntries(
				chips.map((c) => [c.id, { count: c.count, value: chipValues[c.id] }])
			)
		})
	);
</script>

<table class="[&_td]:p-2 [&_th]:p-2">
	<thead>
		<tr>
			<th>Color</th>
			<th>Count</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each chips as chip, i (i)}
			<tr>
				<td>
					<input type="text" class="input" bind:value={chip.id} />
				</td>
				<td>
					<input type="number" class="input" bind:value={chip.count} />
				</td>
				<td>
					{#if i !== 0}
						<button class="btn" onclick={() => chips.splice(i, 1)}>-</button>
					{/if}
				</td>
			</tr>
		{/each}
		<tr>
			<td colspan="2">
				<button class="btn w-full" onclick={() => chips.push({ id: '', count: 0 })}>+</button>
			</td>
		</tr>
	</tbody>
</table>

<label class="block">
	Small Blind
	<input type="number" class="input" bind:value={smallBlind} />
</label>

<label class="block">
	Big Blind
	<input type="number" class="input" bind:value={bigBlind} />
</label>

<label class="block">
	Num Players
	<input type="number" class="input" bind:value={numPlayers} />
</label>

<label class="block">
	Starting Stack / Buy-In
	<input type="number" class="input" bind:value={stackValue} />
</label>

<label class="block">
	Bank Reserve
	<input type="number" class="input" bind:value={bankReserve} />
</label>

<label class="block">
	Target Stack Count
	<input type="number" class="input" bind:value={targetStackCount} />
</label>

<hr />

<h2>Stack</h2>
<table class="[&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2">
	<thead>
		<tr>
			<th>Color</th>
			<th>Value</th>
			<th>Count</th>
		</tr>
	</thead>
	<tbody>
		{#each chips as { id }, i (i)}
			<tr>
				<td>{id}</td>
				<td>{chipValues[id]}</td>
				<td>{stack[id]}</td>
			</tr>
		{/each}
	</tbody>
</table>

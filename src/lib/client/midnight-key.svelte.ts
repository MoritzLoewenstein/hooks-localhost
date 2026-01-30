type MidnightState = {
	key: number;
	midnightTimeoutId: ReturnType<typeof setTimeout> | null;
	subscribers: number;
};

let midnightState = $state<MidnightState>({
	key: 0,
	midnightTimeoutId: null,
	subscribers: 0
});

function getMsUntilMidnight() {
	const now = new Date();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const tomorrow = new Date(now);
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 1, 0); // 00:00:01
	const msUntilMidnight = tomorrow.getTime() - now.getTime();
	return msUntilMidnight;
}

function scheduleNextMidnightUpdate() {
	const msUntilMidnight = getMsUntilMidnight();
	midnightState.midnightTimeoutId = setTimeout(() => {
		midnightState.key++;
		scheduleNextMidnightUpdate();
	}, msUntilMidnight);
}

export const midnight = {
	get state() {
		return midnightState;
	},
	subscribe() {
		if (midnightState.subscribers === 0) {
			scheduleNextMidnightUpdate();
		}
		midnightState.subscribers++;
	},
	unsubscribe() {
		midnightState.subscribers--;
		if (midnightState.subscribers === 0) {
			clearTimeout(midnightState.midnightTimeoutId!);
			midnightState.midnightTimeoutId = null;
		}
	}
};

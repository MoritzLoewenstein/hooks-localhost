interface Toast {
	id: number;
	message: string;
}

let activeToasts = $state<Toast[]>([]);

function createToast() {
	const toast_default_duration = 3000;
	return {
		get value() {
			return activeToasts;
		},
		add: (message: string) => {
			const id = Math.floor(Math.random() * 1000);
			activeToasts.push({ id, message });
			setTimeout(() => {
				activeToasts = activeToasts.filter((t) => t.id !== id);
			}, toast_default_duration);
		},
		remove: (toast_id: number) => {
			activeToasts = activeToasts.filter((t) => t.id !== toast_id);
		}
	};
}

export const toast = createToast();

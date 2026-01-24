export const VIEW = {
	LANDING: 'default',
	INTRO: 'intro',
	SETTINGS: 'settings',
	EDIT_WEBHOOK: 'edit_webhook'
} as const;

type ViewType = (typeof VIEW)[keyof typeof VIEW];

let view_state = $state<ViewType>(VIEW.LANDING);

export const view = {
	get value(): ViewType {
		return view_state;
	},
	set: (view: ViewType) => {
		if (!Object.values(VIEW).includes(view)) {
			throw new Error(`invalid view: ${view}`);
		}
		view_state = view;
	}
};

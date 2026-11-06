import { createContext } from 'svelte';

export class Connectivity {
	online = $state(true);
	reconnected = $state(false);
	blockedSubmission = $state(false);

	mount() {
		this.online = navigator.onLine;
		let timer: ReturnType<typeof setTimeout>;
		const offline = () => {
			clearTimeout(timer);
			this.online = false;
			this.reconnected = false;
		};
		const online = () => {
			if (this.online) return;
			this.online = true;
			this.reconnected = true;
			clearTimeout(timer);
			timer = setTimeout(() => (this.reconnected = false), 4000);
		};
		const submit = (event: SubmitEvent) => {
			if (this.online) {
				this.blockedSubmission = false;
				return;
			}
			event.preventDefault();
			event.stopImmediatePropagation();
			this.blockedSubmission = true;
		};
		window.addEventListener('offline', offline);
		window.addEventListener('online', online);
		document.addEventListener('submit', submit, true);
		return () => {
			clearTimeout(timer);
			window.removeEventListener('offline', offline);
			window.removeEventListener('online', online);
			document.removeEventListener('submit', submit, true);
		};
	}
}

export const [getConnectivity, setConnectivity] = createContext<Connectivity>();

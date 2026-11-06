import { createContext } from 'svelte';

export class AppUpdates {
	available = $state(false);
	dismissed = $state(false);
	dirty = $state(false);
	pending = $state(false);
	error = $state('');
	#registration: ServiceWorkerRegistration | undefined;

	mount() {
		let disposed = false;
		let watchedWorker: ServiceWorker | null = null;
		const detect = () => {
			if (this.#registration?.waiting) this.available = true;
		};
		const watch = () => {
			watchedWorker?.removeEventListener('statechange', detect);
			watchedWorker = this.#registration?.installing ?? null;
			watchedWorker?.addEventListener('statechange', detect);
			detect();
		};
		const check = () => {
			if (!navigator.onLine || document.visibilityState === 'hidden') return;
			// A failed background check leaves the current release usable; the next check retries.
			void this.#registration
				?.update()
				.catch(() => console.warn('Application update check unavailable'));
		};
		const changedController = () => {
			// Other tabs keep their forms. Only the explicit refresh action reloads a document.
			this.available = true;
		};
		const edited = (event: Event) => {
			if (event.target instanceof Element && event.target.closest('form')) this.dirty = true;
		};
		document.addEventListener('input', edited);
		document.addEventListener('change', edited);
		document.addEventListener('visibilitychange', check);
		window.addEventListener('online', check);
		const timer = setInterval(check, 60_000);
		if ('serviceWorker' in navigator) {
			void navigator.serviceWorker.ready.then((registration) => {
				if (disposed) return;
				this.#registration = registration;
				registration.addEventListener('updatefound', watch);
				// Ignore first installation's controller claim.
				if (navigator.serviceWorker.controller) {
					navigator.serviceWorker.addEventListener('controllerchange', changedController);
				} else {
					navigator.serviceWorker.addEventListener(
						'controllerchange',
						() => {
							if (!disposed)
								navigator.serviceWorker.addEventListener('controllerchange', changedController);
						},
						{ once: true }
					);
				}
				watch();
				check();
			});
		}
		return () => {
			disposed = true;
			clearInterval(timer);
			document.removeEventListener('input', edited);
			document.removeEventListener('change', edited);
			document.removeEventListener('visibilitychange', check);
			window.removeEventListener('online', check);
			this.#registration?.removeEventListener('updatefound', watch);
			watchedWorker?.removeEventListener('statechange', detect);
			if ('serviceWorker' in navigator)
				navigator.serviceWorker.removeEventListener('controllerchange', changedController);
		};
	}

	async refresh() {
		if (this.pending) return;
		this.error = '';
		if (!navigator.onLine) {
			this.error = 'Reconnect before refreshing. Your form is still here.';
			return;
		}
		this.pending = true;
		try {
			const worker = this.#registration?.waiting;
			if (worker) {
				await new Promise<void>((resolve, reject) => {
					const cleanup = () => {
						clearTimeout(timer);
						worker.removeEventListener('statechange', changed);
					};
					const changed = () => {
						if (worker.state === 'activated') {
							cleanup();
							resolve();
						} else if (worker.state === 'redundant') {
							cleanup();
							reject(new Error('Update was replaced'));
						}
					};
					const timer = setTimeout(() => {
						cleanup();
						reject(new Error('Update activation timed out'));
					}, 10_000);
					worker.addEventListener('statechange', changed);
					worker.postMessage({ type: 'ACTIVATE_UPDATE' });
				});
			}
			window.location.reload();
		} catch {
			this.error = 'The update could not activate. Your form is still here. Try refreshing again.';
			this.pending = false;
		}
	}
}

export const [getAppUpdates, setAppUpdates] = createContext<AppUpdates>();

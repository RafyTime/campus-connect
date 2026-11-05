import { createContext } from 'svelte';

type InstallPrompt = Event & {
	prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const dismissalKey = 'campus-connect-install-dismissed';

// One controller per layout keeps the banner and Account entry in sync without sharing SSR state.
export class MobileInstallation {
	platform = $state<'android' | 'ios' | null>(null);
	standalone = $state(false);
	dismissed = $state(false);
	prompt = $state<InstallPrompt | null>(null);
	pending = $state(false);
	error = $state('');

	mount() {
		const agent = navigator.userAgent;
		const ios =
			/iPhone|iPad|iPod/.test(agent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
		this.platform = ios ? 'ios' : /Android/.test(agent) ? 'android' : null;
		const displayMode = window.matchMedia('(display-mode: standalone)');
		const updateDisplayMode = () => {
			this.standalone =
				displayMode.matches || ('standalone' in navigator && navigator.standalone === true);
		};
		const readDismissal = () => {
			try {
				this.dismissed = localStorage.getItem(dismissalKey) === 'true';
			} catch {
				// Storage restrictions leave dismissal available for the current visit.
				this.dismissed = false;
			}
		};
		const capturePrompt = (event: Event) => {
			if (!this.platform) return;
			event.preventDefault();
			this.prompt = event as InstallPrompt;
		};
		const installed = () => {
			this.standalone = true;
			this.prompt = null;
		};
		readDismissal();
		updateDisplayMode();
		window.addEventListener('beforeinstallprompt', capturePrompt);
		window.addEventListener('appinstalled', installed);
		window.addEventListener('storage', readDismissal);
		displayMode.addEventListener('change', updateDisplayMode);
		return () => {
			window.removeEventListener('beforeinstallprompt', capturePrompt);
			window.removeEventListener('appinstalled', installed);
			window.removeEventListener('storage', readDismissal);
			displayMode.removeEventListener('change', updateDisplayMode);
		};
	}

	dismiss() {
		this.dismissed = true;
		try {
			localStorage.setItem(dismissalKey, 'true');
		} catch {
			console.warn('Installation banner dismissal could not be saved for later visits.');
		}
	}

	async install() {
		const prompt = this.prompt;
		if (!prompt || this.pending) return;
		this.prompt = null; // Browser prompts are single-use, including a dismissed prompt.
		this.pending = true;
		this.error = '';
		try {
			const choice = await prompt.prompt();
			if (choice.outcome === 'accepted') this.dismiss();
		} catch {
			this.error =
				'Installation could not open. Use your browser’s menu to add Campus Connect to your home screen.';
		} finally {
			this.pending = false;
		}
	}
}

export const [getMobileInstallation, setMobileInstallation] = createContext<MobileInstallation>();

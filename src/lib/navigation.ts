export type ShellDestination = {
	href: string;
	label: string;
};

export const primaryDestinations = [
	{ href: '/', label: 'Discover' },
	{ href: '/groups', label: 'Groups' }
] as const satisfies readonly ShellDestination[];

export const accountDestinations = [
	{ href: '/sign-in', label: 'Sign in' },
	{ href: '/register', label: 'Register' }
] as const satisfies readonly ShellDestination[];

export function isCurrentDestination(pathname: string, href: string): boolean {
	if (href === '/') {
		return pathname === '/';
	}

	return pathname === href || pathname.startsWith(`${href}/`);
}

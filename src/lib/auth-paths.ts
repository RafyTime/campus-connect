export function authenticationHref(page: '/sign-in' | '/register', returnTo: string): string {
	const params = new URLSearchParams();
	if (returnTo.length > 0) {
		params.set('returnTo', returnTo);
	}

	const query = params.toString();
	return query.length > 0 ? `${page}?${query}` : page;
}

export function currentReturnPath(url: Pick<URL, 'pathname' | 'search'>): string {
	return `${url.pathname}${url.search}`;
}

export type SessionUser = {
	id: string;
	displayName: string;
};

export function toSessionUser(user: { id: string; name: string }): SessionUser {
	return {
		id: user.id,
		displayName: user.name
	};
}

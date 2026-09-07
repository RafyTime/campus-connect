export function subscriberCountLabel(count: number): string {
	if (count <= 0) return 'No subscribers';
	if (count === 1) return '1 subscriber';
	return `${count} subscribers`;
}

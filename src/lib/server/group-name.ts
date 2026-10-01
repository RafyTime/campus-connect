/** Unique Group names use trim, NFC, locale-independent Unicode lowercase, then NFC. */
export function groupNameKey(name: string): string {
	return name.trim().normalize('NFC').toLowerCase().normalize('NFC');
}

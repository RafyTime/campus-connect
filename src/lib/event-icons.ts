import {
	Calendar03Icon,
	Cancel01Icon,
	Clock01Icon,
	FavouriteIcon,
	Megaphone01Icon,
	Ticket01Icon
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/svelte';
import type { PublicEventStatus, PublicResponseMode } from '$lib/public-event';

export function eventStatusIcon(status: PublicEventStatus): IconSvgElement {
	if (status === 'cancelled') return Cancel01Icon;
	if (status === 'ended') return Clock01Icon;
	return Calendar03Icon;
}

export function capacityStateIcon(
	responseMode: PublicResponseMode,
	capacityState: string
): IconSvgElement {
	if (responseMode === 'registration') {
		if (capacityState === 'Full') return Cancel01Icon;
		return Ticket01Icon;
	}

	if (responseMode === 'interest') return FavouriteIcon;
	return Megaphone01Icon;
}

export type PublicEventHost = {
	id: string;
	displayName: string;
	imageUrl: string | null;
	imageAttribution: string | null;
	initials: string;
};

export type PublicEventTag = {
	id: string;
	name: string;
};

export type PublicEventStatus = 'scheduled' | 'cancelled' | 'ended';
export type PublicResponseMode = 'announcement' | 'interest' | 'registration';

export type PublicEventSummary = {
	id: string;
	title: string;
	startsAt: Date;
	endsAt: Date;
	scheduleLabel: string;
	host: PublicEventHost;
	locationLabel: string;
	tags: PublicEventTag[];
	responseMode: PublicResponseMode;
	capacityState: string;
	status: PublicEventStatus;
};

export type PublicEventDetail = PublicEventSummary & {
	description: string;
	exactTimeLabel: string;
};

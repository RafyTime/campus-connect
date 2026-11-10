const allowedImageHosts = new Set(['upload.wikimedia.org']);

export const wikimediaHostPortraitUrl =
	'https://upload.wikimedia.org/wikipedia/commons/5/57/Man_silhouette.svg';

export const wikimediaHostPortraitAttribution =
	'Man silhouette by Liftarn, CC BY-SA 2.5, via Wikimedia Commons';

export const missingWikimediaAvatarUrl =
	'https://upload.wikimedia.org/wikipedia/commons/0/00/campus-connect-missing-avatar.svg';

const imageAttributionByUrl: Record<string, string> = {
	[wikimediaHostPortraitUrl]: wikimediaHostPortraitAttribution
};

export function publicImageUrl(imageUrl: string | null | undefined): string | null {
	if (!imageUrl) return null;

	try {
		const host = new URL(imageUrl).hostname;
		return allowedImageHosts.has(host) ? imageUrl : null;
	} catch {
		return null;
	}
}

export function imageAttribution(imageUrl: string | null): string | null {
	if (!imageUrl) return null;
	return imageAttributionByUrl[imageUrl] ?? null;
}

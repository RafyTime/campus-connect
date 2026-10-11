export const campusTags = [
	{ id: 'tag-arts', name: 'Arts' },
	{ id: 'tag-food', name: 'Food' },
	{ id: 'tag-language', name: 'Language' },
	{ id: 'tag-music', name: 'Music' },
	{ id: 'tag-outdoors', name: 'Outdoors' },
	{ id: 'tag-social', name: 'Social' },
	{ id: 'tag-sports', name: 'Sports' },
	{ id: 'tag-study', name: 'Study' },
	{ id: 'tag-tech', name: 'Tech' },
	{ id: 'tag-wellness', name: 'Wellness' }
] as const;

export const campusLocations = [
	{
		id: 'location-foyer',
		label: 'Main building foyer',
		latitude: 50.6444,
		longitude: 7.2272
	},
	{
		id: 'location-library',
		label: 'Campus Library',
		latitude: 50.6443,
		longitude: 7.2274
	},
	{
		id: 'location-cafeteria',
		label: 'Campus Cafeteria',
		latitude: 50.6445,
		longitude: 7.227
	},
	{
		id: 'location-sports',
		label: 'Sports field',
		latitude: 50.6438,
		longitude: 7.2265
	},
	{
		id: 'location-town',
		label: 'Bad Honnef town centre',
		latitude: null,
		longitude: null
	}
] as const;

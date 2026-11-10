<script lang="ts">
	import { onMount, tick, untrack } from 'svelte';
	import { Alert02Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { getAppUpdates } from '#lib/app-updates.svelte.js';
	import { formatCampusSchedule } from '#lib/campus-time.js';
	import { getConnectivity } from '#lib/connectivity.svelte.js';
	import { displayInitials } from '#lib/display-initials.js';
	import EventCard from '#lib/components/event-card.svelte';
	import EventMap from '#lib/components/event-map.svelte';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import * as Tabs from '#lib/components/ui/tabs/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { createEventForm, editEventForm, loadMyEvents } from '#lib/events.remote.js';
	import {
		parseCampusInput,
		parseEventDetails,
		responseModes,
		type EventAuthoringOptions,
		type EventFieldErrors,
		type EventFormValues,
		type ManagedEvent
	} from '#lib/event-authoring.js';
	import { capacityStateLabel, responseModeLabel } from '#lib/event-labels.js';
	import { searchEventLocations } from '#lib/geocoding.remote.js';
	import type { GeocodingResult } from '#lib/geocoding.js';
	import type { PublicEventSummary } from '#lib/public-event.js';

	let {
		mode,
		options,
		initial
	}: { mode: 'create' | 'edit'; options: EventAuthoringOptions; initial?: ManagedEvent } = $props();
	const defaults = $derived<EventFormValues>(
		initial ?? {
			hostGroupId: '',
			title: '',
			description: '',
			startsAt: '',
			endsAt: '',
			tagIds: [],
			responseMode: 'announcement',
			capacity: '',
			locationId: '',
			manualLocation: ''
		}
	);
	const locked = $derived(mode === 'edit' && Boolean(initial?.participationLocked));
	const editForm = $derived(editEventForm.for(initial?.id ?? ''));
	const form = $derived(mode === 'create' ? createEventForm : editForm);
	const hostGroupId = $derived(form.fields.hostGroupId.value() ?? defaults.hostGroupId);
	const responseMode = $derived(form.fields.responseMode.value() ?? defaults.responseMode);
	const locationId = $derived(form.fields.locationId.value() ?? defaults.locationId);
	const updates = getAppUpdates();
	const connection = getConnectivity();
	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});

	const hostItems = $derived([
		{ value: '', label: 'Yourself · Personal Event' },
		...options.groups.map((group) => ({ value: group.id, label: group.name }))
	]);
	const responseItems = responseModes.map((value) => ({ value, label: responseModeLabel(value) }));
	const campusItems = $derived(
		options.locations.map((place) => ({ value: place.id, label: place.label }))
	);

	// Each mode remembers its own choice; only the active mode's choice is submitted as `locationId`.
	type LocationMode = 'campus' | 'address' | 'manual';
	// The edit page re-mounts this form per Event, so the saved Location only seeds initial state.
	const savedLocation = untrack(() => initial?.location);
	const savedLocationId = untrack(() => initial?.locationId ?? '');
	let locationMode = $state<LocationMode>(
		savedLocationId === 'manual'
			? 'manual'
			: savedLocationId.startsWith('geocode:')
				? 'address'
				: 'campus'
	);
	let campusChoice = $state(
		savedLocationId !== 'manual' && !savedLocationId.startsWith('geocode:') ? savedLocationId : ''
	);
	let addressChoice = $state<GeocodingResult | null>(
		savedLocationId.startsWith('geocode:') &&
			savedLocation?.latitude != null &&
			savedLocation.longitude != null
			? {
					id: savedLocationId,
					label: savedLocation.label,
					latitude: savedLocation.latitude,
					longitude: savedLocation.longitude
				}
			: null
	);
	function setLocation(id: string) {
		form.fields.locationId.set(id);
		updates.dirty = true;
	}
	function switchLocationMode(next: string) {
		if (next !== 'campus' && next !== 'address' && next !== 'manual') return;
		locationMode = next;
		setLocation(
			next === 'campus' ? campusChoice : next === 'address' ? (addressChoice?.id ?? '') : 'manual'
		);
	}
	function chooseAddress(result: GeocodingResult | null) {
		addressChoice = result;
		setLocation(result?.id ?? '');
	}
	const chosenPlace = $derived(
		locationMode === 'campus'
			? options.locations.find((place) => place.id === campusChoice)
			: locationMode === 'address'
				? addressChoice
				: undefined
	);
	const mappedPlace = $derived(
		chosenPlace?.latitude != null && chosenPlace.longitude != null
			? {
					label: chosenPlace.label,
					latitude: chosenPlace.latitude,
					longitude: chosenPlace.longitude
				}
			: null
	);

	let addressQuery = $state('');
	let searchPending = $state(false);
	let searchMessage = $state('');
	let searchFailed = $state(false);
	let addressResults = $state<GeocodingResult[]>([]);
	async function searchAddress() {
		if (searchPending) return;
		searchPending = true;
		searchFailed = false;
		searchMessage = '';
		addressResults = [];
		try {
			const result = await searchEventLocations(addressQuery);
			if (result.ok) {
				addressResults = result.results;
				searchFailed = !result.results.length;
				searchMessage =
					result.results.length === 0
						? 'No addresses found. Try another search, or'
						: result.results.length === 1
							? '1 address found. Choose your meeting point.'
							: `${result.results.length} addresses found. Choose your meeting point.`;
			} else {
				searchFailed = true;
				searchMessage =
					result.reason === 'rate-limited'
						? 'Search is busy. Try again shortly, or'
						: 'Address search is unavailable. Try again later, or';
			}
		} catch {
			searchFailed = true;
			searchMessage = 'Address search is unavailable. Try again later, or';
		} finally {
			searchPending = false;
		}
	}

	// Mirrors the public summary so Creators see their Event as it will appear in Discover.
	const previewEvent = $derived.by((): PublicEventSummary => {
		const startsAt = parseCampusInput(form.fields.startsAt.value() ?? defaults.startsAt);
		const endsAt = parseCampusInput(form.fields.endsAt.value() ?? defaults.endsAt);
		const host = initial?.host ??
			options.hosts.find((option) =>
				hostGroupId
					? option.type === 'group' && option.id === hostGroupId
					: option.type === 'personal'
			) ?? {
				type: 'personal',
				id: 'preview',
				displayName: 'You',
				imageUrl: null,
				imageAttribution: null,
				initials: displayInitials('You')
			};
		const tagIds = form.fields.tagIds.value() ?? defaults.tagIds;
		const manualLocation = form.fields.manualLocation.value() ?? defaults.manualLocation;
		const capacity = Number(form.fields.capacity.value() ?? defaults.capacity) || null;
		return {
			id: initial?.id ?? 'preview',
			title: (form.fields.title.value() ?? defaults.title).trim() || 'Your Event title',
			startsAt: startsAt ?? new Date(),
			endsAt: endsAt ?? new Date(),
			scheduleLabel:
				startsAt && endsAt ? formatCampusSchedule(startsAt, endsAt) : 'Add a start and end',
			host,
			locationLabel:
				locationMode === 'manual'
					? manualLocation.trim() || 'Plain-text Location'
					: (chosenPlace?.label ?? 'Choose a Location'),
			tags: options.tags.filter((tag) => tagIds.includes(tag.id)),
			responseMode,
			capacityState: capacityStateLabel(
				responseMode,
				capacity === null ? null : capacity - (initial?.registrationCount ?? 0)
			),
			status: 'scheduled'
		};
	});

	let clientErrors = $state<EventFieldErrors>({});
	let transportFailure = $state(false);
	let uncertain = $state(false);
	let checking = $state(false);
	let recoveryMessage = $state('');
	let attempted = $state<
		Extract<ReturnType<typeof parseEventDetails>, { ok: true }>['value'] | null
	>(null);
	let attemptedHost = '';
	let savedMatches = $state<Awaited<ReturnType<typeof loadMyEvents>>>([]);
	async function checkSavedEvents() {
		if (checking || !connection.online || !attempted) return;
		checking = true;
		try {
			const events = loadMyEvents();
			await events.refresh();
			savedMatches = (await events).filter((event) =>
				mode === 'edit'
					? event.id === initial?.id
					: event.title === attempted?.title &&
						event.startsAt.getTime() === attempted.startsAt.getTime() &&
						(attemptedHost
							? event.host.type === 'group' && event.host.id === attemptedHost
							: event.host.type === 'personal')
			);
			uncertain = mode === 'create' && savedMatches.length > 0;
			recoveryMessage = savedMatches.length
				? 'A saved Event may match your request. Review it before making another change.'
				: 'No matching saved Event was found. Review your draft before trying again.';
		} catch {
			recoveryMessage = 'Could not check saved Events. Reconnect and check again.';
		} finally {
			checking = false;
		}
	}
	const generalIssue = $derived(
		form.fields.allIssues()?.find((issue) => !issue.path?.length)?.message
	);

	function issues(field: keyof EventFormValues) {
		return clientErrors[field]
			? [{ message: clientErrors[field] }]
			: (form.fields[field].issues() ?? []);
	}
</script>

{#snippet sectionHeading(title: string)}
	<Field.Legend class="font-heading text-lg tracking-tight">{title}</Field.Legend>
{/snippet}

<div class="grid min-w-0 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
	<form
		{...form.enhance(async (submission) => {
			if (uncertain) return;
			transportFailure = false;
			recoveryMessage = '';
			savedMatches = [];
			const values = { ...defaults, ...submission.fields.value() };
			const parsed = parseEventDetails(
				{ ...values, capacity: responseMode === 'registration' ? values.capacity : '' },
				new Date(),
				mode === 'create'
			);
			clientErrors = parsed.ok ? {} : parsed.fieldErrors;
			if (!parsed.ok) {
				await tick();
				submission.element
					.querySelector<HTMLElement>('[aria-invalid="true"]:not([type="hidden"])')
					?.focus();
				return;
			}
			try {
				attempted = parsed.value;
				attemptedHost = values.hostGroupId;
				await submission.submit();
			} catch {
				transportFailure = true;
				uncertain = true;
			}
		})}
		class="flex w-full min-w-0 flex-col gap-8"
		novalidate
		aria-busy={Boolean(form.pending)}
	>
		{#if mode === 'edit'}<input {...editForm.fields.eventId.as('hidden', initial?.id ?? '')} />{/if}
		<!-- Styled selects and Location modes write these fields; the hidden inputs carry them on submission. -->
		{#if mode === 'create'}<input {...form.fields.hostGroupId.as('hidden', hostGroupId)} />{/if}
		<input {...form.fields.responseMode.as('hidden', responseMode)} />
		<input {...form.fields.locationId.as('hidden', locationId)} />
		{#if transportFailure || generalIssue}
			<Alert.Root variant="destructive">
				<HugeiconsIcon icon={Alert02Icon} aria-hidden="true" />
				<Alert.Title>Could not save Event</Alert.Title>
				<Alert.Description
					>{transportFailure
						? recoveryMessage ||
							"We couldn't confirm your Event was saved. Check saved Events before trying again."
						: generalIssue}</Alert.Description
				>
			</Alert.Root>
			{#if transportFailure}
				<div class="flex flex-wrap gap-2">
					<Button
						variant="outline"
						disabled={checking || !connection.online}
						onclick={checkSavedEvents}>Check saved Events</Button
					>
					{#each savedMatches as event (event.id)}
						<Button href={`/events/${event.id}`} variant="outline">Review saved Event</Button>
					{/each}
				</div>
			{/if}
		{/if}
		{#if locked}
			<Alert.Root>
				<Alert.Title>Participation protects this Event</Alert.Title>
				<Alert.Description
					>Response mode, start, end and Location are locked. You can update the title, description
					and Tags, or increase capacity.</Alert.Description
				>
			</Alert.Root>
		{/if}

		<Field.Set>
			{@render sectionHeading('The plan')}
			<Field.Group>
				{#if mode === 'create'}
					<Field.Field data-invalid={issues('hostGroupId').length > 0 || undefined}>
						<Field.Label for="event-host">Host</Field.Label>
						<Select.Root
							type="single"
							items={hostItems}
							bind:value={() => hostGroupId, (value: string) => form.fields.hostGroupId.set(value)}
							disabled={!hydrated}
						>
							<Select.Trigger
								id="event-host"
								class="min-h-11 w-full"
								aria-invalid={issues('hostGroupId').length > 0}
								aria-describedby="event-host-help event-host-error"
							>
								<Select.Value />
							</Select.Trigger>
							<Select.Content>
								{#each hostItems as item (item.value)}
									<Select.Item value={item.value} label={item.label} />
								{/each}
							</Select.Content>
						</Select.Root>
						<Field.Description id="event-host-help">
							{options.groups.length
								? 'Publish as yourself or a Group you own or represent. The host cannot change after publication.'
								: 'You do not own or represent any Groups. You can publish a personal Event.'}
						</Field.Description>
						<Field.Error id="event-host-error" errors={issues('hostGroupId')} />
					</Field.Field>
				{:else if initial}
					<p class="text-muted-foreground">
						Host: {initial.host.displayName}. Published by {initial.author.displayName}. The host
						cannot change.
					</p>
				{/if}
				<Field.Field data-invalid={issues('title').length > 0 || undefined}>
					<Field.Label for="event-title">Title</Field.Label>
					<!-- Bind to field state so hydration preserves early browser edits. Copy attributes for SSR overrides. -->
					<Input
						{...{ ...form.fields.title.as('text', defaults.title) }}
						bind:value={
							() => form.fields.title.value() ?? defaults.title,
							(value: string) => form.fields.title.set(value)
						}
						id="event-title"
						class="min-h-11"
						maxlength={100}
						aria-invalid={issues('title').length > 0}
						aria-describedby="event-title-help event-title-error"
					/>
					<Field.Description id="event-title-help">Use 5 to 100 characters.</Field.Description>
					<Field.Error id="event-title-error" errors={issues('title')} />
				</Field.Field>
				<Field.Field data-invalid={issues('description').length > 0 || undefined}>
					<Field.Label for="event-description">Description</Field.Label>
					<Textarea
						{...{ ...form.fields.description.as('text', defaults.description) }}
						bind:value={
							() => form.fields.description.value() ?? defaults.description,
							(value: string) => form.fields.description.set(value)
						}
						id="event-description"
						class="min-h-32"
						maxlength={2000}
						aria-invalid={issues('description').length > 0}
						aria-describedby="event-description-help event-description-error"
					/>
					<Field.Description id="event-description-help"
						>Use 20 to 2,000 characters. Text and line breaks appear as written.</Field.Description
					>
					<Field.Error id="event-description-error" errors={issues('description')} />
				</Field.Field>
				<Field.Set disabled={!hydrated} data-invalid={issues('tagIds').length > 0 || undefined}>
					<Field.Legend variant="label">Tags</Field.Legend>
					<Field.Description id="event-tags-help"
						>Choose one to three from the campus list.</Field.Description
					>
					<Field.Group class="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{#each options.tags as tag (tag.id)}
							<Field.Field orientation="horizontal" class="min-h-11 gap-2">
								<Checkbox
									id={`event-${tag.id}`}
									{...form.fields.tagIds.as('checkbox', tag.id, defaults.tagIds.includes(tag.id))}
									type="button"
									onCheckedChange={(checked) => {
										updates.dirty = true;
										const selected = form.fields.tagIds.value() ?? defaults.tagIds;
										form.fields.tagIds.set(
											checked ? [...selected, tag.id] : selected.filter((id) => id !== tag.id)
										);
									}}
									aria-invalid={issues('tagIds').length > 0}
									aria-describedby="event-tags-help event-tags-error"
								/>
								<Field.Label for={`event-${tag.id}`} class="min-h-11 flex-1 cursor-pointer"
									>{tag.name}</Field.Label
								>
							</Field.Field>
						{/each}
					</Field.Group>
					<Field.Error id="event-tags-error" errors={issues('tagIds')} />
				</Field.Set>
			</Field.Group>
		</Field.Set>

		<Field.Set class="border-t pt-6">
			{@render sectionHeading('Time and responses')}
			<Field.Group>
				<Field.Set>
					<Field.Legend variant="label">Schedule</Field.Legend>
					<Field.Description>Enter all dates and times in Europe/Berlin.</Field.Description>
					<Field.Group class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
						{#each ['startsAt', 'endsAt'] as field (field)}
							{@const key = field === 'startsAt' ? 'startsAt' : 'endsAt'}
							<Field.Field class="min-w-0" data-invalid={issues(key).length > 0 || undefined}>
								<Field.Label for={`event-${key}`}
									>{key === 'startsAt' ? 'Start' : 'End'}</Field.Label
								>
								<Input
									{...{ ...form.fields[key].as('datetime-local', defaults[key]) }}
									bind:value={
										() => form.fields[key].value() ?? defaults[key],
										(value: string) => form.fields[key].set(value)
									}
									readonly={locked}
									id={`event-${key}`}
									class="min-h-11 min-w-0"
									aria-invalid={issues(key).length > 0}
									aria-describedby={`event-${key}-error`}
								/>
								<Field.Error id={`event-${key}-error`} errors={issues(key)} />
							</Field.Field>
						{/each}
					</Field.Group>
				</Field.Set>
				<Field.Field data-invalid={issues('responseMode').length > 0 || undefined}>
					<Field.Label for="event-response-mode">Response mode</Field.Label>
					<Select.Root
						type="single"
						items={responseItems}
						bind:value={
							() => responseMode,
							(value: string) => {
								const next = responseModes.find((item) => item === value);
								if (next) form.fields.responseMode.set(next);
							}
						}
						disabled={!hydrated || locked}
					>
						<Select.Trigger
							id="event-response-mode"
							class="min-h-11 w-full"
							aria-invalid={issues('responseMode').length > 0}
							aria-describedby="event-response-help event-response-error"
						>
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							{#each responseItems as item (item.value)}
								<Select.Item value={item.value} label={item.label} />
							{/each}
						</Select.Content>
					</Select.Root>
					<Field.Description id="event-response-help"
						>Announcement shares information. Interest records interest. Registration reserves
						limited places.</Field.Description
					>
					<Field.Error id="event-response-error" errors={issues('responseMode')} />
				</Field.Field>
				{#if responseMode === 'registration'}
					<Field.Field data-invalid={issues('capacity').length > 0 || undefined}>
						<Field.Label for="event-capacity">Capacity</Field.Label>
						<Input
							{...{ ...form.fields.capacity.as('text', defaults.capacity) }}
							bind:value={
								() => form.fields.capacity.value() ?? defaults.capacity,
								(value: string | number | undefined) =>
									form.fields.capacity.set(value === undefined ? '' : String(value))
							}
							type="number"
							id="event-capacity"
							class="min-h-11"
							min={locked ? Number(defaults.capacity) : 1}
							step={1}
							inputmode="numeric"
							aria-invalid={issues('capacity').length > 0}
							aria-describedby="event-capacity-error"
						/>
						<Field.Error id="event-capacity-error" errors={issues('capacity')} />
					</Field.Field>
				{/if}
			</Field.Group>
		</Field.Set>

		<Field.Set class="border-t pt-6" data-invalid={issues('locationId').length > 0 || undefined}>
			{@render sectionHeading('Where are we meeting?')}
			<Field.Description>Choose a meeting place, then check the pin on the map.</Field.Description>
			<Tabs.Root
				value={locationMode}
				onValueChange={switchLocationMode}
				class="min-w-0 gap-5"
				aria-label="Location type"
			>
				<Tabs.List class="h-auto! w-full">
					<Tabs.Trigger value="campus" class="min-h-11" disabled={!hydrated || locked}
						>On campus</Tabs.Trigger
					>
					<Tabs.Trigger value="address" class="min-h-11" disabled={!hydrated || locked}
						>Address</Tabs.Trigger
					>
					<Tabs.Trigger value="manual" class="min-h-11" disabled={!hydrated || locked}
						>Plain text</Tabs.Trigger
					>
				</Tabs.List>

				<Tabs.Content value="campus" class="flex min-w-0 flex-col gap-3">
					<Field.Field>
						<Field.Label for="event-location">Campus place</Field.Label>
						<Select.Root
							type="single"
							items={campusItems}
							bind:value={
								() => campusChoice,
								(value: string) => {
									campusChoice = value;
									setLocation(value);
								}
							}
							disabled={!hydrated || locked}
						>
							<!-- The default placeholder tone misses WCAG AA contrast on the input background. -->
							<Select.Trigger
								id="event-location"
								class="min-h-11 w-full data-placeholder:text-foreground/80"
								aria-invalid={issues('locationId').length > 0}
								aria-describedby="event-location-error"
							>
								<Select.Value placeholder="Choose a campus place" />
							</Select.Trigger>
							<Select.Content>
								{#each campusItems as item (item.value)}
									<Select.Item value={item.value} label={item.label} />
								{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
				</Tabs.Content>

				<Tabs.Content value="address" class="flex min-w-0 flex-col gap-3">
					{#if addressChoice}
						<div
							class="flex min-w-0 items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4"
						>
							<HugeiconsIcon
								icon={Tick02Icon}
								class="mt-0.5 shrink-0 text-primary"
								size={18}
								aria-hidden="true"
							/>
							<div class="min-w-0 flex-1">
								<p class="text-sm text-muted-foreground">Meeting at</p>
								<p class="leading-relaxed font-medium break-words">{addressChoice.label}</p>
							</div>
							{#if !locked}
								<Button
									type="button"
									variant="ghost"
									class="min-h-11 shrink-0"
									onclick={() => chooseAddress(null)}>Change</Button
								>
							{/if}
						</div>
					{:else}
						<Field.Field>
							<Field.Label for="address-query">Search for an address</Field.Label>
							<div class="flex min-w-0 gap-2">
								<Input
									id="address-query"
									bind:value={addressQuery}
									maxlength={200}
									class="min-h-11 min-w-0 flex-1"
									aria-describedby="address-query-help address-search-status"
									onkeydown={(event) => {
										if (event.key === 'Enter') {
											event.preventDefault();
											void searchAddress();
										}
									}}
								/>
								<Button
									type="button"
									variant="outline"
									class="min-h-11 min-w-20"
									disabled={searchPending || !hydrated || !connection.online}
									onclick={searchAddress}
								>
									{#if searchPending}<Spinner role="presentation" aria-hidden="true" /><span
											class="sr-only">Searching</span
										>{:else}Search{/if}
								</Button>
							</div>
							<Field.Description id="address-query-help"
								>Search Germany within the Bonn-Cologne region. Search runs only when you ask. Do
								not submit private or confidential information. Address data © <a
									href="https://www.openstreetmap.org/copyright"
									class="underline">OpenStreetMap contributors</a
								>.</Field.Description
							>
						</Field.Field>
						<p id="address-search-status" role="status" class="text-sm">
							{#if searchPending}<span class="text-muted-foreground"
									>Looking for places near Bonn and Cologne…</span
								>{:else}{searchMessage}{/if}
							{#if searchFailed && !searchPending}
								<button
									type="button"
									class="min-h-11 underline underline-offset-4"
									onclick={() => switchLocationMode('manual')}>use a plain-text Location</button
								>.
							{/if}
						</p>
						{#if addressResults.length && !searchPending}
							<ul class="flex min-w-0 flex-col gap-2" aria-label="Address results">
								{#each addressResults as result (result.id)}
									<li>
										<button
											type="button"
											class="flex min-h-11 w-full min-w-0 flex-col gap-1 rounded-xl border p-4 text-left text-sm transition-colors hover:border-primary hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/30"
											onclick={() => chooseAddress(result)}
										>
											<span class="leading-relaxed break-words">{result.label}</span>
											<span class="text-primary">Use this address</span>
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					{/if}
				</Tabs.Content>

				<Tabs.Content value="manual" class="flex min-w-0 flex-col gap-3">
					<Field.Field data-invalid={issues('manualLocation').length > 0 || undefined}>
						<Field.Label for="event-manual-location">Location label</Field.Label>
						<Input
							{...{ ...form.fields.manualLocation.as('text', defaults.manualLocation) }}
							bind:value={
								() => form.fields.manualLocation.value() ?? defaults.manualLocation,
								(value: string) => form.fields.manualLocation.set(value)
							}
							readonly={locked}
							id="event-manual-location"
							class="min-h-11"
							placeholder="e.g. The courtyard picnic tables"
							aria-invalid={issues('manualLocation').length > 0}
							aria-describedby="event-manual-location-help event-manual-location-error"
						/>
						<Field.Description id="event-manual-location-help"
							>Describe the meeting place. Plain-text Locations have no map marker.</Field.Description
						>
						<Field.Error id="event-manual-location-error" errors={issues('manualLocation')} />
					</Field.Field>
				</Tabs.Content>
			</Tabs.Root>
			<Field.Error id="event-location-error" errors={issues('locationId')} />
			{#if mappedPlace}
				<EventMap
					label={mappedPlace.label}
					latitude={mappedPlace.latitude}
					longitude={mappedPlace.longitude}
				/>
			{/if}
		</Field.Set>

		<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
			<Button
				type="submit"
				class="min-h-11"
				disabled={Boolean(form.pending) || uncertain || checking}
			>
				{#if form.pending}<span data-icon="inline-start"
						><Spinner role="presentation" aria-hidden="true" /></span
					>{/if}
				{mode === 'create' ? 'Publish Event' : 'Save changes'}
			</Button>
			<Button
				href={mode === 'create' ? '/my-events' : `/events/${initial?.id}`}
				variant="outline"
				class="min-h-11">Cancel</Button
			>
		</div>
	</form>
	<aside class="sticky top-24 hidden min-w-0 flex-col gap-3 lg:flex" aria-label="Discover preview">
		<p class="text-sm text-muted-foreground">How your Event appears in Discover</p>
		<EventCard event={previewEvent} preview />
	</aside>
</div>

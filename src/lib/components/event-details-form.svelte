<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import * as NativeSelect from '$lib/components/ui/native-select';
	import { Spinner } from '$lib/components/ui/spinner';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createPersonalEventForm, editPersonalEventForm } from '$lib/events.remote';
	import {
		parseEventDetails,
		responseModes,
		type EventAuthoringOptions,
		type EventFieldErrors,
		type EventFormValues,
		type ManagedPersonalEvent
	} from '$lib/event-authoring';
	import { responseModeLabel } from '$lib/event-labels';
	import { tick } from 'svelte';

	let {
		mode,
		options,
		initial
	}: { mode: 'create' | 'edit'; options: EventAuthoringOptions; initial?: ManagedPersonalEvent } =
		$props();
	const defaults = $derived<EventFormValues>(
		initial ?? {
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
	const form = $derived(
		mode === 'create' ? createPersonalEventForm : editPersonalEventForm.for(initial?.id ?? '')
	);
	const responseMode = $derived(form.fields.responseMode.value() ?? defaults.responseMode);
	const locationId = $derived(form.fields.locationId.value() ?? defaults.locationId);
	let clientErrors = $state<EventFieldErrors>({});
	let transportFailure = $state(false);
	const generalIssue = $derived(
		form.fields.allIssues()?.find((issue) => !issue.path?.length)?.message
	);

	function issues(field: keyof EventFormValues) {
		return clientErrors[field]
			? [{ message: clientErrors[field] }]
			: (form.fields[field].issues() ?? []);
	}
</script>

<form
	{...form.enhance(async (submission) => {
		transportFailure = false;
		const data = new FormData(submission.element);
		const parsed = parseEventDetails(
			{ ...Object.fromEntries(data), tagIds: data.getAll('tagIds[]') },
			new Date(),
			mode === 'create'
		);
		clientErrors = parsed.ok ? {} : parsed.fieldErrors;
		if (!parsed.ok) {
			await tick();
			submission.element.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
			return;
		}
		try {
			await submission.submit();
		} catch {
			transportFailure = true;
		}
	})}
	class="flex w-full min-w-0 flex-col gap-6"
	novalidate
	aria-busy={Boolean(form.pending)}
>
	{#if mode === 'edit'}<input
			{...editPersonalEventForm.fields.eventId.as('hidden', initial?.id ?? '')}
		/>{/if}
	{#if transportFailure || generalIssue}
		<Alert.Root variant="destructive">
			<Alert.Title>Could not save Event</Alert.Title>
			<Alert.Description
				>{transportFailure ? 'The request failed. Try again.' : generalIssue}</Alert.Description
			>
		</Alert.Root>
	{/if}
	<Field.Group>
		<Field.Field data-invalid={issues('title').length > 0 || undefined}>
			<Field.Label for="event-title">Title</Field.Label>
			<Input
				{...form.fields.title.as('text', defaults.title)}
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
				{...form.fields.description.as('text', defaults.description)}
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
		<Field.Set>
			<Field.Legend>Schedule</Field.Legend>
			<Field.Description>Enter all dates and times in Europe/Berlin.</Field.Description>
			<Field.Group class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
				{#each ['startsAt', 'endsAt'] as field (field)}
					{@const key = field === 'startsAt' ? 'startsAt' : 'endsAt'}
					<Field.Field class="min-w-0" data-invalid={issues(key).length > 0 || undefined}>
						<Field.Label for={`event-${key}`}>{key === 'startsAt' ? 'Start' : 'End'}</Field.Label>
						<Input
							{...form.fields[key].as('datetime-local', defaults[key])}
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
		<Field.Set data-invalid={issues('tagIds').length > 0 || undefined}>
			<Field.Legend>Tags</Field.Legend>
			<Field.Description id="event-tags-help"
				>Choose one to three from the campus list.</Field.Description
			>
			<Field.Group class="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{#each options.tags as tag (tag.id)}
					<Field.Field orientation="horizontal" class="min-h-11 gap-2">
						<Checkbox
							id={`event-${tag.id}`}
							name="tagIds[]"
							value={tag.id}
							checked={(form.fields.tagIds.value() ?? defaults.tagIds).includes(tag.id)}
							onCheckedChange={(checked) => {
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
		<Field.Field data-invalid={issues('responseMode').length > 0 || undefined}>
			<Field.Label for="event-response-mode">Response mode</Field.Label>
			<NativeSelect.Root
				{...form.fields.responseMode.as('select', defaults.responseMode)}
				id="event-response-mode"
				class="w-full [&_select]:min-h-11"
				aria-invalid={issues('responseMode').length > 0}
				aria-describedby="event-response-help event-response-error"
			>
				{#each responseModes as mode (mode)}<NativeSelect.Option value={mode}
						>{responseModeLabel(mode)}</NativeSelect.Option
					>{/each}
			</NativeSelect.Root>
			<Field.Description id="event-response-help"
				>Announcement shares information. Interest records interest. Registration reserves limited
				places.</Field.Description
			>
			<Field.Error id="event-response-error" errors={issues('responseMode')} />
		</Field.Field>
		{#if responseMode === 'registration'}
			<Field.Field data-invalid={issues('capacity').length > 0 || undefined}>
				<Field.Label for="event-capacity">Capacity</Field.Label>
				<Input
					{...form.fields.capacity.as('text', defaults.capacity)}
					type="number"
					id="event-capacity"
					class="min-h-11"
					min={1}
					step={1}
					inputmode="numeric"
					aria-invalid={issues('capacity').length > 0}
					aria-describedby="event-capacity-error"
				/>
				<Field.Error id="event-capacity-error" errors={issues('capacity')} />
			</Field.Field>
		{/if}
		<Field.Field data-invalid={issues('locationId').length > 0 || undefined}>
			<Field.Label for="event-location">Location</Field.Label>
			<NativeSelect.Root
				{...form.fields.locationId.as('select', defaults.locationId)}
				id="event-location"
				class="w-full [&_select]:min-h-11"
				aria-invalid={issues('locationId').length > 0}
				aria-describedby="event-location-error"
			>
				<NativeSelect.Option value="">Choose a Location</NativeSelect.Option>
				{#each options.locations as location (location.id)}<NativeSelect.Option value={location.id}
						>{location.label}</NativeSelect.Option
					>{/each}
				<NativeSelect.Option value="manual">Plain-text Location</NativeSelect.Option>
			</NativeSelect.Root>
			<Field.Error id="event-location-error" errors={issues('locationId')} />
		</Field.Field>
		{#if locationId === 'manual'}
			<Field.Field data-invalid={issues('manualLocation').length > 0 || undefined}>
				<Field.Label for="event-manual-location">Location label</Field.Label>
				<Input
					{...form.fields.manualLocation.as('text', defaults.manualLocation)}
					id="event-manual-location"
					class="min-h-11"
					aria-invalid={issues('manualLocation').length > 0}
					aria-describedby="event-manual-location-help event-manual-location-error"
				/>
				<Field.Description id="event-manual-location-help"
					>Describe the meeting place. Plain-text Locations have no map marker.</Field.Description
				>
				<Field.Error id="event-manual-location-error" errors={issues('manualLocation')} />
			</Field.Field>
		{/if}
	</Field.Group>
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
		<Button type="submit" class="min-h-11" disabled={Boolean(form.pending)}>
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

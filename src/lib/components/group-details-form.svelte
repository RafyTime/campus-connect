<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '$lib/components/ui/spinner';
	import { createGroupForm, editGroupForm } from '$lib/groups.remote';

	let {
		mode,
		groupId = '',
		name = '',
		description = ''
	}: { mode: 'create' | 'edit'; groupId?: string; name?: string; description?: string } = $props();

	const form = $derived(mode === 'create' ? createGroupForm : editGroupForm);
	const nameIssues = $derived(form.fields.name.issues() ?? []);
	const descriptionIssues = $derived(form.fields.description.issues() ?? []);
	const formIssues = $derived(form.fields.allIssues() ?? []);
	let transportFailure = $state(false);
</script>

<form
	{...form.enhance(async (submission) => {
		transportFailure = false;
		try {
			await submission.submit();
		} catch {
			transportFailure = true;
		}
	})}
	class="flex w-full flex-col gap-6"
	novalidate
	aria-busy={Boolean(form.pending)}
>
	{#if mode === 'edit'}
		<input {...form.fields.groupId.as('hidden', groupId)} />
	{/if}
	{#if transportFailure}
		<Alert.Root variant="destructive">
			<Alert.Title>Could not save Group</Alert.Title>
			<Alert.Description>The request failed. Try again.</Alert.Description>
		</Alert.Root>
	{/if}

	{#if formIssues.some((issue) => !issue.path?.length)}
		<Alert.Root variant="destructive">
			<Alert.Title>Could not save Group</Alert.Title>
			<Alert.Description>
				{formIssues.find((issue) => !issue.path?.length)?.message}
			</Alert.Description>
		</Alert.Root>
	{/if}

	<Field.FieldGroup>
		<Field.Field data-invalid={nameIssues.length > 0 ? true : undefined}>
			<Field.Label for="group-name">Group name</Field.Label>
			<Input
				{...form.fields.name.as('text', name)}
				id="group-name"
				class="h-11 min-h-11"
				maxlength={80}
				aria-invalid={nameIssues.length > 0}
				aria-describedby={nameIssues.length > 0 ? 'group-name-error' : 'group-name-help'}
			/>
			<Field.Description id="group-name-help"
				>Use a unique name between 2 and 80 characters.</Field.Description
			>
			<Field.Error id="group-name-error" errors={nameIssues} />
		</Field.Field>

		<Field.Field data-invalid={descriptionIssues.length > 0 ? true : undefined}>
			<Field.Label for="group-description">Short description</Field.Label>
			<textarea
				{...form.fields.description.as('text', description)}
				id="group-description"
				class="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
				maxlength={300}
				aria-invalid={descriptionIssues.length > 0}
				aria-describedby={descriptionIssues.length > 0
					? 'group-description-error'
					: 'group-description-help'}></textarea>
			<Field.Description id="group-description-help"
				>Describe your Group in 10 to 300 characters.</Field.Description
			>
			<Field.Error id="group-description-error" errors={descriptionIssues} />
		</Field.Field>
	</Field.FieldGroup>

	<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
		<Button type="submit" class="min-h-11" disabled={Boolean(form.pending)}>
			{#if form.pending}
				<Spinner class="size-4" role="presentation" aria-hidden="true" />
			{/if}
			{mode === 'create' ? 'Create Group' : 'Save changes'}
		</Button>
		<Button
			href={mode === 'create' ? '/groups' : `/groups/${groupId}`}
			variant="outline"
			class="min-h-11"
		>
			Cancel
		</Button>
	</div>
</form>

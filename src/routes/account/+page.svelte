<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '$lib/components/ui/spinner';
	import { signOutAccount, updateDisplayName } from '$lib/accounts.remote';
	import AccountPage from '$lib/components/account-page.svelte';

	let { data }: { data: { displayName: string } } = $props();

	const form = updateDisplayName;
	const displayNameIssues = $derived(form.fields.displayName.issues() ?? []);
</script>

<AccountPage
	title="Account"
	description="Edit the display name Campus Connect shows for you, or sign out on this device."
>
	<form {...form} class="flex flex-col gap-6" novalidate>
		<Field.FieldGroup>
			<Field.Field data-invalid={displayNameIssues.length > 0 ? true : undefined}>
				<Field.Label for="displayName">Display name</Field.Label>
				<Input
					id="displayName"
					class="h-11 min-h-11"
					autocomplete="name"
					{...form.fields.displayName.as('text', data.displayName)}
				/>
				<Field.Error errors={displayNameIssues} />
			</Field.Field>
		</Field.FieldGroup>

		<Button type="submit" class="min-h-11" disabled={Boolean(form.pending)}>
			{#if form.pending}
				<Spinner class="size-4" role="presentation" aria-hidden="true" />
			{/if}
			Save display name
		</Button>
	</form>

	<form {...signOutAccount}>
		<Button
			type="submit"
			variant="outline"
			class="min-h-11"
			disabled={Boolean(signOutAccount.pending)}
		>
			{#if signOutAccount.pending}
				<Spinner class="size-4" role="presentation" aria-hidden="true" />
			{/if}
			Sign out
		</Button>
	</form>
</AccountPage>

<script lang="ts">
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import { registerAccount } from '#lib/accounts.remote.js';
	import { authenticationHref } from '#lib/auth-paths.js';
	import AccountPage from '#lib/components/account-page.svelte';

	let { data }: { data: { returnTo: string } } = $props();

	const form = registerAccount;
	const displayNameIssues = $derived(form.fields.displayName.issues() ?? []);
	const emailIssues = $derived(form.fields.email.issues() ?? []);
	const passwordIssues = $derived(form.fields._password.issues() ?? []);
	const formIssues = $derived(form.fields.allIssues() ?? []);
</script>

<AccountPage
	title="Register"
	description="Create a Campus Connect account with a display name, email, and password."
>
	<form {...form} class="flex flex-col gap-6" novalidate>
		<input {...form.fields.returnTo.as('hidden', data.returnTo)} />

		{#if formIssues.some((issue) => !issue.path?.length)}
			<Alert.Root variant="destructive">
				<Alert.Title>Registration failed</Alert.Title>
				<Alert.Description>
					{formIssues.find((issue) => !issue.path?.length)?.message}
				</Alert.Description>
			</Alert.Root>
		{/if}

		<Field.FieldGroup>
			<Field.Field data-invalid={displayNameIssues.length > 0 ? true : undefined}>
				<Field.Label for="displayName">Display name</Field.Label>
				<Input
					id="displayName"
					class="h-11 min-h-11"
					autocomplete="name"
					{...{ ...form.fields.displayName.as('text') }}
					bind:value={
						() => form.fields.displayName.value() ?? '',
						(value: string) => form.fields.displayName.set(value)
					}
				/>
				<Field.Error errors={displayNameIssues} />
			</Field.Field>

			<Field.Field data-invalid={emailIssues.length > 0 ? true : undefined}>
				<Field.Label for="email">Email</Field.Label>
				<Input
					id="email"
					class="h-11 min-h-11"
					autocomplete="email"
					{...{ ...form.fields.email.as('email') }}
					bind:value={
						() => form.fields.email.value() ?? '', (value: string) => form.fields.email.set(value)
					}
				/>
				<Field.Error errors={emailIssues} />
			</Field.Field>

			<Field.Field data-invalid={passwordIssues.length > 0 ? true : undefined}>
				<Field.Label for="password">Password</Field.Label>
				<Input
					id="password"
					class="h-11 min-h-11"
					autocomplete="new-password"
					{...{ ...form.fields._password.as('password') }}
					bind:value={
						() => form.fields._password.value() ?? '',
						(value: string) => form.fields._password.set(value)
					}
				/>
				<Field.Error errors={passwordIssues} />
			</Field.Field>
		</Field.FieldGroup>

		<Button type="submit" class="min-h-11" disabled={Boolean(form.pending)}>
			{#if form.pending}
				<Spinner class="size-4" role="presentation" aria-hidden="true" />
			{/if}
			Create account
		</Button>
	</form>

	<p class="text-sm text-muted-foreground">
		Already have an account?
		<Button
			href={authenticationHref('/sign-in', data.returnTo)}
			variant="link"
			class="min-h-11 px-1"
		>
			Sign in
		</Button>
	</p>
</AccountPage>

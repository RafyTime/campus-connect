<script lang="ts">
	import { page } from '$app/state';
	import { authenticationHref, currentReturnPath } from '$lib/auth-paths';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const returnTo = $derived(currentReturnPath(page.url));
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Sign in to continue</Dialog.Title>
			<Dialog.Description>
				This action needs a Campus Connect account. You will return here after sign-in or
				registration.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="flex flex-col gap-2 sm:flex-col">
			<Button
				href={authenticationHref('/sign-in', returnTo)}
				class="min-h-11 w-full"
				onclick={() => (open = false)}
			>
				Sign in
			</Button>
			<Button
				href={authenticationHref('/register', returnTo)}
				variant="outline"
				class="min-h-11 w-full"
				onclick={() => (open = false)}
			>
				Register
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
</script>

<svelte:head>
	<title>Loading preview · Campus Connect</title>
</svelte:head>

<h1 class="font-heading text-2xl font-medium tracking-tight">Loading preview</h1>
<Alert.Root class="mt-4">
	<Alert.Title>Route-level loading</Alert.Title>
	<Alert.Description>
		This preview waits before rendering so the shell loading state can be checked during navigation.
	</Alert.Description>
</Alert.Root>

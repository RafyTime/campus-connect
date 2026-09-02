<script lang="ts">
	import HostAvatar from '$lib/components/host-avatar.svelte';
</script>

<svelte:head>
	<title>Remote image failure preview · Campus Connect</title>
</svelte:head>

<div class="flex flex-col gap-4">
	<h1 class="font-heading text-2xl font-medium tracking-tight">Remote image failure</h1>
	<p class="text-muted-foreground">
		This preview uses a constrained-host URL that does not resolve, so the host avatar must fall
		back to initials.
	</p>
	<div class="flex items-center gap-3">
		<HostAvatar
			displayName="Mira Okonkwo"
			imageUrl="https://upload.wikimedia.org/wikipedia/commons/0/00/campus-connect-missing-avatar.svg"
			initials="MO"
			size="lg"
		/>
		<p class="font-medium">Mira Okonkwo</p>
	</div>
</div>

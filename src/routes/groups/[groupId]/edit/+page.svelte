<script lang="ts">
	import GroupDetailsForm from '$lib/components/group-details-form.svelte';
	let { data }: { data: { groupId: string; name: string; description: string } } = $props();
</script>

<svelte:head>
	<title>Edit {data.name} · Campus Connect</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
	<header class="flex flex-col gap-2">
		<h1 class="font-heading text-2xl font-medium tracking-tight">Edit Group</h1>
		<p class="text-muted-foreground">Update the name and description shown to everyone.</p>
	</header>
	<GroupDetailsForm
		mode="edit"
		groupId={data.groupId}
		name={data.name}
		description={data.description}
	/>
</div>

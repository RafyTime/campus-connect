<script lang="ts">
	import GroupDetailsForm from '$lib/components/group-details-form.svelte';
</script>

<svelte:head>
	<title>Create Group · Campus Connect</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
	<header class="flex flex-col gap-2">
		<h1 class="font-heading text-2xl font-medium tracking-tight">Create a Group</h1>
		<p class="text-muted-foreground">
			Give your campus community a name and a short description. You will become its owner.
		</p>
	</header>
	<GroupDetailsForm mode="create" />
</div>

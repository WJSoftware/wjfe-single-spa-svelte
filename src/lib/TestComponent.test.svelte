<script lang="ts">
    const {
        propA = false
    } : {
        propA: boolean;
    } = $props();
</script>

<div role="alert" data-propA={propA}></div>

<script lang="ts">
    import { getSingleSpaContext } from "$lib/singleSpaContext.js";
    import { getContext } from "svelte";

    const {
        propA = false
    } : {
        propA?: boolean;
    } = $props();

    const sspaContext = getSingleSpaContext();
    sspaContext?.library?.mountRootParcel?.();
    // @ts-expect-error Arguments intentionally omitted.
    sspaContext?.mountParcel?.();
    getContext<Function>("extra")?.();
</script>

<div role="alert" data-propA={propA}></div>

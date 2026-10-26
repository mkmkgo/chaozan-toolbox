<template>
    <header class="flex justify-center px-4 py-2 sm:py-4">
        <div class="flex items-center gap-2">
            <h1 class="text-2xl sm:text-3xl font-bold">{{ title }}</h1>
        </div>
    </header>
</template>

<script>
export default {
    data() {
        return {
            title: import.meta.env.VITE_APP_TITLE
        };
    }
};
</script>
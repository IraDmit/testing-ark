<template>
    <div class="input-wrp">
        <IconSearch />
        <input type="text" :placeholder="placeholder" v-model="search" />
    </div>
</template>

<script setup lang="ts">
import IconSearch from "../icons/iconSearch.vue";

const search = defineModel<string>();

const props = withDefaults(
    defineProps<{
        placeholder: string;
    }>(),
    { placeholder: "Введите текст" },
);
</script>

<style scoped lang="scss">
.input-wrp {
    background-color: var(--color-bg-app);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-md);
    padding: 5px 9px;
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
    min-width: 258px;
    max-width: 258px;
    display: flex;
    width: 100%;

    input {
        background: unset;
        border: unset;
        outline: none;
        font-family: var(--font-family);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        line-height: var(--line-height-normal);
        color: var(--color-text-secondary);
        padding: unset;
        width: 100%;
        height: 100%;
    }
}
</style>

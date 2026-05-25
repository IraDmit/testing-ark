<template>
    <header class="header">
        <div class="header_logo">AIRESTO | Супра</div>

        <div class="header_panel">
            <AppInput v-model="search" :placeholder="'⌘+Л поиск по имени'" />

            <button type="button" class="header_action" @click="switchTheme">
                <IconSun />
            </button>

            <button type="button" class="header_action header_action--logout">
                <IconExit />

                <span>Выйти</span>
            </button>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref } from "vue";

import IconSun from "../icons/iconSun.vue";
import AppInput from "../ui/appInput.vue";
import IconExit from "../icons/iconExit.vue";

const search = ref("");

const isDarkTheme = ref(true);

const switchTheme = () => {
    isDarkTheme.value = !isDarkTheme.value;
    document.documentElement.setAttribute(
        "data-theme",
        isDarkTheme.value ? "" : "light",
    );
};
</script>

<style scoped lang="scss">
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 8px 20px;

    background: var(--color-bg-muted);

    &_logo {
        font-family: var(--font-family);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        line-height: var(--line-height-normal);
        color: var(--color-text-primary);
    }

    &_panel {
        display: flex;
        align-items: center;
        gap: var(--gap-sm);
    }

    &_action {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--gap-xs);

        padding: 5px 6px;

        border: none;
        border-radius: var(--radius-xs);
        outline: none;

        background-color: var(--color-bg-muted);

        font-family: var(--font-family);
        font-size: var(--font-size-xs);
        font-weight: var(-font-weight-regular);
        line-height: var(--line-height-relaxed);
        color: var(--color-text-primary);

        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
            opacity: 0.6;
        }

        &--logout {
            padding: 4px 6px;
        }

        img {
            width: 14px;
            height: 14px;
            object-fit: contain;
        }
    }
}
</style>

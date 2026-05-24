<template>
  <header class="header">
    <div class="header_logo">AIRESTO | Супра</div>

    <div class="header_panel">
      <AppInput v-model="search" :placeholder="'⌘+Л поиск по имени'" />

      <button type="button" class="header_action">
        <IconSun />
      </button>

      <button type="button" class="header_action header_action--logout">
        <img src="/icon/iconExit.webp" alt="exit" />

        <span>Выйти</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import IconSun from '../icons/iconSun.vue'
import AppInput from '../ui/appInput.vue'

const search = ref('')
</script>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 8px 20px;

  background: rgba(255, 255, 255, 0.08);

  &_logo {
    font-family: var(--font-family);
    font-size: 11px;
    font-weight: 600;
    line-height: 127%;
    color: #fff;
  }

  &_panel {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &_action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    padding: 5px 6px;

    border: none;
    border-radius: 4px;
    outline: none;

    background-color: var(--gray);

    font-family: var(--font-family);
    font-size: 11px;
    font-weight: 400;
    line-height: 145%;
    color: #fff;

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

<template>
  <div class="input-wrp">
    <img src="/icon/iconSearch.webp" atl="icon-search" />
    <input type="text" :placeholder="placeholder" v-model="search" />
  </div>
</template>

<script setup lang="ts">
const search = defineModel<string>()

const props = withDefaults(
  defineProps<{
    placeholder: string
  }>(),
  { placeholder: 'Введите текст' },
)
</script>

<style scoped lang="scss">
.input-wrp {
  background-color: var(--black);
  border: 1px solid var(--gray);
  border-radius: 8px;
  padding: 5px 9px;
  display: flex;
  align-items: center;
  grid-gap: 8px;
  min-width: 258px;
  max-width: 258px;
  display: flex;
  width: 100%;

  input {
    background: unset;
    border: unset;
    outline: none;
    font-family: var(--font-family);
    font-weight: 400;
    font-size: 11px;
    line-height: 127%;
    color: rgba(255, 255, 255, 0.64);
    padding: unset;
    width: 100%;
    height: 100%;
  }
}
</style>

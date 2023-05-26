<script setup lang="ts">
import type { Foo } from '@kolibryjs/dep-import-type-test/deep'

const msg: Foo = {}
</script>

<template>
  <p>import type should be removed without side-effect</p>
</template>

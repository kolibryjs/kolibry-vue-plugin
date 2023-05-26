import { defineBuildConfig } from 'buildkarium'

export default defineBuildConfig({
   entries: ['src/index'],
   externals: ['kolibry', 'vue/compiler-sfc', '@vue/compiler-sfc'],
   clean: true,
   declaration: true,
   rollup: {
      emitCJS: true,
      inlineDependencies: true,
   },
})

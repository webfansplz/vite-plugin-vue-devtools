import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts, transformerCompileClass, transformerDirectives, transformerVariantGroup } from 'unocss'

// @ts-expect-error missing type?
import { unocssPreset as devtoolsUIKitUnoPreset } from '@nuxt/devtools-ui-kit/unocss'

export default defineConfig({
  shortcuts: [
    {
      // General Tokens
      'bg-base': 'n-bg-base',
      'bg-active': 'n-bg-active',
      'border-base': 'n-border-base',
      'glass-effect': 'backdrop-blur-6 bg-white/80 dark:bg-[#151515]/90',
      'navbar-glass': 'sticky z-10 top-0 glass-effect',

      'text-secondary': 'color-black/50 dark:color-white/50',

      // Reusable
      'x-divider': 'h-1px w-full bg-gray/15',

      // Data type
      'raw-literal': 'text-[#03c] dark:text-[#997fff]',
      'raw-string': 'text-[#222] dark:text-[#c41a16]',
      'raw-object': 'text-[#444] dark:text-[#bdc6cf]',
      'raw-function': 'text-[#03c] dark:text-[#997fff] font-italic',
      'raw-null': 'text-[#999]',

      // Vue block
      'vue-block-hover': 'hover:dark:bg-[#2c3e50] hover:bg-[#c2e9d7]',
      'vue-block-active': 'bg-[#3ba776] text-white',
      'vue-block-text': 'text-#42b983',
      'vue-block-title': 'flex items-center pl-2 text-sm font-400 lh-8',
      'vue-block': 'mb-2 cursor-pointer',

      // Vue tag
      'vue-tag-symbol': 'text-gray-400 dark:text-gray-600',
      'vue-tag-symbol-active': 'text-white/60',
    },
    [/^theme-card-(\w+)$/, $ => `p2 flex gap2 border border-base bg-base items-center rounded min-w-40 min-h-25 justify-center transition-all saturate-0 op50 shadow hover:(op100 bg-${$[1]}/10 text-${$[1]}6 saturate-100)`],
  ],
  theme: {
    colors: {
      primary: '#03ae67',
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      prefix: ['i-', ''],
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,500',
        mono: 'Fira Code',
      },
    }),
    devtoolsUIKitUnoPreset(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
    transformerCompileClass(),
  ],
  safelist: [
    'i-carbon-information',
    'i-carbon-tree-view-alt',
    'i-carbon-assembly-cluster',
    'i-carbon-image-copy',
    'mdi:location-path',
    'icon-park-outline:pineapple',
    'i-icon-park-outline:vertical-timeline',
    'i-carbon-network-4',
    'i-carbon-ibm-watson-discovery',
    'i-carbon-select-window',
    'i-teenyicons:npm-outline',
    'i-carbon-document-preliminary',
    'i-mdi:eyedropper',
  ],
})

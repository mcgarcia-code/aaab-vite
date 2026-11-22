import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,

  {
    rules: {
      // El proyecto no usa punto y coma: una línea que empieza con ( [ o ` se pega a la anterior
      // (ej. "const x = {}" + "(lista || []).forEach(...)" = llamar a {} como función).
      // skipFormatting la apaga; se vuelve a activar porque detecta ese error, no es de formato.
      'no-unexpected-multiline': 'error',
      // Regla del proyecto (AGENTS.md): sin punto y coma. Se corrige sola con "npm run lint"
      semi: ['error', 'never'],
    },
  },
])

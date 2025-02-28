import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});


const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Permitir el uso de 'any' en ciertos casos
      "@typescript-eslint/no-explicit-any": "off", // Cambiado de 'error' a 'warn'
      
      // Configuración para variables no utilizadas
      "@typescript-eslint/no-unused-vars": ["error", {
        // Ignorar variables que empiezan con '_' o usadas en destructuring
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        // Permite variables no utilizadas en la desestructuración
        "ignoreRestSiblings": true
      }],
      
      // Otras reglas que podrían ser útiles
      "no-console": ["warn", { allow: ["warn", "error", "info"] }], // Permitir ciertos console.*
      "prefer-const": "warn", // Usar const cuando no se reasigna
    },
    
  }
];


export default eslintConfig;

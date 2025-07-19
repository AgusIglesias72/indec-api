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
      "@typescript-eslint/no-explicit-any": "off", // Cambiado de 'error' a 'warn',
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "react-hooks/exhaustive-deps": "warn",
      
      
      // Configuración para variables no utilizadas
      "@typescript-eslint/no-unused-vars": "off", 
    
      
      // Otras reglas que podrían ser útiles
      "no-console": ["warn", { allow: ["warn", "error", "info"] }], // Permitir ciertos console.*
      "prefer-const": "warn", // Usar const cuando no se reasigna
    },
    
  }
];


export default eslintConfig;

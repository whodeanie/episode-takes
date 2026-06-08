import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // Local-first views hydrate browser storage after mount; the async season
      // loader also resets visible loading state when its input changes.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  { ignores: [".next/**", "node_modules/**"] },
];

export default config;

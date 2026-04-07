const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  mode: "jit",
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
      },
      borderRadius: {
        DEFAULT: "8px",
        secondary: "4px",
        container: "12px",
      },
      boxShadow: {
        DEFAULT: "0 1px 4px rgba(0, 0, 0, 0.1)",
        hover: "0 2px 8px rgba(0, 0, 0, 0.12)",
        dark: "0 1px 4px rgba(0, 0, 0, 0.3)",
      },
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          dark: "#60A5FA",
        },
        secondary: {
          DEFAULT: "#6B7280",
          hover: "#4B5563",
        },
        accent: {
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",
        },
      },
      spacing: {
        "form-field": "16px",
        section: "32px",
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover", "active", "dark"],
      backgroundColor: ["dark"],
      textColor: ["dark"],
      borderColor: ["dark"],
    },
  },
};

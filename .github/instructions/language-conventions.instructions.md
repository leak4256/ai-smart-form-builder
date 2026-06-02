---
description: "Use when writing or editing frontend UI text and code comments in this project."
applyTo: "frontend/src/**/*.{ts,tsx,js,jsx}"
---

# Language Conventions

- Write all user-facing UI text in Hebrew.
- Write all code comments in English.
- Keep identifiers, function names, and technical code in English unless a domain term requires otherwise.
- If a change introduces new visible copy, check that it reads naturally in Hebrew.
- If a change introduces comments, keep them brief and only where they add real clarity.

# Styling Conventions

- Prefer Tailwind utility classes for styling in frontend code.
- Avoid adding regular CSS when Tailwind can express the same style.
- Use regular CSS only for global resets/base rules, third-party overrides, or cases that are impractical in Tailwind.
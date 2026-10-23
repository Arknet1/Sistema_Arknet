import fs from 'fs';
import path from 'path';

const root = process.cwd();
const tokensPath = path.join(root, 'src', 'styles', 'hr-tokens.json');
const outputPath = path.join(root, 'src', 'styles', 'hr-theme.css');

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));

const css = `@import "tailwindcss";
@import "tw-animate-css";

/* J.Matos Recursos Humanos - Design System Theme */
/* Generated automatically from hr-tokens.json - DO NOT EDIT DIRECTLY */

:root,
.hr-root {
  --hr-primary: ${tokens.colors.primary};
  --hr-primary-hover: ${tokens.colors.primaryHover};
  --hr-primary-soft: ${tokens.colors.primarySoft};
  --hr-brand-orange: ${tokens.colors.brandOrange};

  --hr-bg: ${tokens.colors.bg};
  --hr-surface: ${tokens.colors.surface};
  --hr-surface-muted: ${tokens.colors.surfaceMuted};
  --hr-border: ${tokens.colors.border};
  --hr-border-subtle: ${tokens.colors.borderSubtle};
  --hr-border-focus: ${tokens.colors.borderFocus};

  --hr-text: ${tokens.colors.text};
  --hr-text-muted: ${tokens.colors.textMuted};
  --hr-text-light: ${tokens.colors.textLight};

  --hr-status-success: ${tokens.colors.status.success};
  --hr-status-success-bg: ${tokens.colors.status.successBg};
  --hr-status-warning: ${tokens.colors.status.warning};
  --hr-status-warning-bg: ${tokens.colors.status.warningBg};
  --hr-status-error: ${tokens.colors.status.error};
  --hr-status-error-bg: ${tokens.colors.status.errorBg};
  --hr-status-neutral: ${tokens.colors.status.neutral};
  --hr-status-neutral-bg: ${tokens.colors.status.neutralBg};

  --hr-spacing-1: ${tokens.spacing['1']};
  --hr-spacing-2: ${tokens.spacing['2']};
  --hr-spacing-3: ${tokens.spacing['3']};
  --hr-spacing-4: ${tokens.spacing['4']};
  --hr-spacing-5: ${tokens.spacing['5']};
  --hr-spacing-6: ${tokens.spacing['6']};
  --hr-spacing-8: ${tokens.spacing['8']};
  --hr-spacing-12: ${tokens.spacing['12']};

  --hr-touch-target: ${tokens.touch.minTarget};

  --hr-radius-sm: ${tokens.radii.sm};
  --hr-radius: ${tokens.radii.md};
  --hr-radius-lg: ${tokens.radii.lg};
  --hr-radius-full: ${tokens.radii.full};

  --hr-font-family: var(--font-source-sans), ${tokens.typography.fontFamily};
  --hr-font-xs: ${tokens.typography.sizes.xs};
  --hr-font-sm: ${tokens.typography.sizes.sm};
  --hr-font-base: ${tokens.typography.sizes.base};
  --hr-font-md: ${tokens.typography.sizes.md};
  --hr-font-lg: ${tokens.typography.sizes.lg};
  --hr-font-xl: ${tokens.typography.sizes.xl};

  --hr-shadow-sm: ${tokens.shadows.sm};
  --hr-shadow-md: ${tokens.shadows.md};
  --hr-shadow-lg: ${tokens.shadows.lg};
}

/* Reset and base styles for HR layout */
html.hr-html,
body.hr-root {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: var(--hr-bg);
  color: var(--hr-text);
  font-family: var(--hr-font-family);
  font-size: var(--hr-font-base);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.hr-root *,
.hr-root *::before,
.hr-root *::after {
  box-sizing: border-box;
}

/* Ensure minimum touch target for interactive elements in HR */
.hr-root button,
.hr-root a,
.hr-root input,
.hr-root select,
.hr-root textarea {
  font-family: inherit;
}

/* Focus styles */
.hr-root :focus-visible {
  outline: 2px solid var(--hr-primary);
  outline-offset: 2px;
}

/* Subtle scrollbars */
.hr-root ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.hr-root ::-webkit-scrollbar-track {
  background: transparent;
}
.hr-root ::-webkit-scrollbar-thumb {
  background: var(--hr-border);
  border-radius: var(--hr-radius-sm);
}
.hr-root ::-webkit-scrollbar-thumb:hover {
  background: var(--hr-text-light);
}

/* Print optimizations */
@media print {
  .hr-no-print {
    display: none !important;
  }
}
`;

fs.writeFileSync(outputPath, css, 'utf-8');
console.log(`Generated ${outputPath} successfully.`);

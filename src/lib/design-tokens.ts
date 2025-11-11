/**
 * Design Tokens
 * 
 * Centralized design system tokens following shadcn/ui patterns.
 * These tokens define the visual language of the application.
 * 
 * @see https://ui.shadcn.com
 */

export const designTokens = {
  /**
   * Spacing Scale
   * Based on 4px base unit system (shadcn/ui standard)
   */
  spacing: {
    '0.5': '0.125rem',  // 2px
    '1': '0.25rem',     // 4px
    '1.5': '0.375rem',  // 6px
    '2': '0.5rem',      // 8px
    '2.5': '0.625rem',  // 10px
    '3': '0.75rem',     // 12px
    '3.5': '0.875rem',  // 14px
    '4': '1rem',        // 16px
    '5': '1.25rem',     // 20px
    '6': '1.5rem',      // 24px
    '7': '1.75rem',     // 28px
    '8': '2rem',        // 32px
    '9': '2.25rem',     // 36px
    '10': '2.5rem',     // 40px
    '11': '2.75rem',    // 44px
    '12': '3rem',       // 48px
    '14': '3.5rem',     // 56px
    '16': '4rem',       // 64px
    '20': '5rem',       // 80px
    '24': '6rem',       // 96px
    '32': '8rem',       // 128px
    '40': '10rem',      // 160px
    '48': '12rem',      // 192px
    '64': '16rem',      // 256px
    '80': '20rem',      // 320px
    '96': '24rem',      // 384px
  } as const,

  /**
   * Typography Scale
   * Font sizes with corresponding line heights
   */
  typography: {
    fontFamily: {
      sans: ['var(--font-sans)', 'Inter Variable', 'system-ui', 'sans-serif'],
      mono: ['var(--font-mono)', 'ui-monospace', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: { size: '0.75rem', lineHeight: '1rem' },      // 12px / 16px
      sm: { size: '0.875rem', lineHeight: '1.25rem' },  // 14px / 20px
      base: { size: '1rem', lineHeight: '1.5rem' },     // 16px / 24px
      lg: { size: '1.125rem', lineHeight: '1.75rem' },   // 18px / 28px
      xl: { size: '1.25rem', lineHeight: '1.75rem' },    // 20px / 28px
      '2xl': { size: '1.5rem', lineHeight: '2rem' },    // 24px / 32px
      '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px / 36px
      '4xl': { size: '2.25rem', lineHeight: '2.5rem' },  // 36px / 40px
      '5xl': { size: '3rem', lineHeight: '1' },          // 48px
      '6xl': { size: '3.75rem', lineHeight: '1' },       // 60px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  } as const,

  /**
   * Border Radius
   * Consistent rounding for UI elements
   */
  borderRadius: {
    none: '0',
    sm: 'calc(var(--radius) - 4px)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',
    xl: 'calc(var(--radius) + 4px)',
    full: '9999px',
  } as const,

  /**
   * Shadows
   * Elevation system for depth
   */
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  } as const,

  /**
   * Transitions
   * Animation timing and easing
   */
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  } as const,

  /**
   * Z-Index Scale
   * Layering system for overlays and modals
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  } as const,

  /**
   * Breakpoints
   * Responsive design breakpoints (matching Tailwind defaults)
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  } as const,
} as const;

/**
 * Semantic spacing tokens for common use cases
 */
export const semanticSpacing = {
  // Component spacing
  cardPadding: designTokens.spacing['6'],      // 24px
  cardGap: designTokens.spacing['4'],         // 16px
  sectionGap: designTokens.spacing['8'],      // 32px
  pagePadding: designTokens.spacing['4'],     // 16px (mobile)
  pagePaddingDesktop: designTokens.spacing['8'], // 32px (desktop)
  
  // Form spacing
  formGap: designTokens.spacing['4'],         // 16px
  formFieldGap: designTokens.spacing['2'],    // 8px
  inputPadding: designTokens.spacing['3'],    // 12px
  
  // Navigation spacing
  navItemGap: designTokens.spacing['2'],      // 8px
  navSectionGap: designTokens.spacing['4'],    // 16px
} as const;

/**
 * Type exports for TypeScript usage
 */
export type SpacingKey = keyof typeof designTokens.spacing;
export type TypographySize = keyof typeof designTokens.typography.fontSize;
export type BorderRadiusKey = keyof typeof designTokens.borderRadius;




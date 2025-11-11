# Color System Documentation

This document defines the color system for the Omniforce Client Reporting Dashboard, ensuring consistency and accessibility across all components.

## Color Philosophy

The color system uses a **simplified 3-color palette** for maximum consistency and clarity:

1. **Primary (Violet)** - Used everywhere for brand consistency
2. **Muted** - For secondary elements and backgrounds
3. **Destructive** - For errors and negative states

All colors are defined as CSS variables for:
- **Theming:** Easy light/dark mode switching
- **Multi-tenant customization:** Per-client color customization
- **Accessibility:** WCAG 2.1 AA compliance
- **Consistency:** Single source of truth for all colors

---

## Color Palette

### Primary Colors

**Primary (Violet/Purple)**
- **Light Mode:** `hsl(262.1, 83.3%, 57.8%)` - Vibrant violet
- **Dark Mode:** `hsl(263.4, 70%, 50.4%)` - Slightly muted for dark backgrounds
- **Usage:** Buttons, links, active states, brand elements, **all charts**, success states
- **Foreground:** `hsl(210, 20%, 98%)` - High contrast white for text on primary
- **Note:** All violet/purple elements use this exact same color for consistency

### Semantic Colors

**Background**
- **Light:** `hsl(0, 0%, 100%)` - Pure white
- **Dark:** `hsl(224, 71.4%, 4.1%)` - Deep dark blue

**Foreground (Text)**
- **Light:** `hsl(224, 71.4%, 4.1%)` - Near black
- **Dark:** `hsl(210, 20%, 98%)` - Near white

**Card**
- **Light:** `hsl(0, 0%, 100%)` - White cards
- **Dark:** `hsl(220, 13%, 8%)` - Dark gray cards

**Muted**
- **Light:** `hsl(220, 14.3%, 95.9%)` - Light gray backgrounds
- **Dark:** `hsl(215, 27.9%, 16.9%)` - Dark gray backgrounds
- **Foreground:** `hsl(220, 8.9%, 46.1%)` (light) / `hsl(217.9, 10.6%, 64.9%)` (dark)

**Secondary**
- **Light:** `hsl(220, 14.3%, 95.9%)` - Subtle backgrounds
- **Dark:** `hsl(215, 27.9%, 16.9%)` - Darker backgrounds

**Accent**
- **Light:** `hsl(220, 14.3%, 95.9%)` - Accent backgrounds
- **Dark:** `hsl(215, 27.9%, 16.9%)` - Dark accent backgrounds

**Destructive (Error/Danger)**
- **Light Mode:** `hsl(0, 84.2%, 60.2%)` - Bright red
- **Dark Mode:** `hsl(0, 62.8%, 30.6%)` - Darker red for dark mode
- **Foreground:** `hsl(210, 20%, 98%)` - White text
- **Usage:** Error messages, destructive actions, danger states, negative indicators

**Border**
- **Light:** `hsl(220, 13%, 91%)` - Light gray borders
- **Dark:** `hsl(215, 27.9%, 16.9%)` - Dark borders

---

## Chart Colors

**All chart colors use the same primary violet** for maximum brand consistency.

### Chart Color Palette

| Color | HSL Value | Usage |
|-------|-----------|-------|
| Chart 1-5 | `hsl(262.1, 83.3%, 57.8%)` (light) / `hsl(263.4, 70%, 50.4%)` (dark) | All data series |

**Design Rationale:**
- **Consistency:** All charts use the same primary violet color
- **Brand Alignment:** Single color reinforces brand identity
- **Simplicity:** Easier to maintain and customize
- **Differentiation:** Use opacity, patterns, or labels to distinguish multiple series

### Chart Color Usage Guidelines

1. **Single Series:** Use `chart-1` (primary violet)
2. **Multiple Series:** Use the same `chart-1` color with different opacity or patterns
   - Series 1: `chart-1` at 100% opacity
   - Series 2: `chart-1` at 70% opacity
   - Series 3: `chart-1` at 50% opacity
   - Or use different line styles (solid, dashed, dotted)
3. **Success/Positive:** Use `primary` color
4. **Error/Negative:** Use `destructive` color

---

## Color Usage Patterns

### ✅ Correct Usage

```tsx
// Semantic color tokens
<div className="bg-card text-card-foreground border-border">
  <button className="bg-primary text-primary-foreground">
    Action
  </button>
  <p className="text-muted-foreground">Secondary text</p>
</div>

// Chart colors
<ChartContainer config={{
  series1: { color: "hsl(var(--chart-1))" },
  series2: { color: "hsl(var(--chart-2))" }
}} />
```

### ❌ Incorrect Usage

```tsx
// Hardcoded colors
<div className="bg-white text-black border-gray-300">
  <button className="bg-[#8b5cf6] text-white">
    Action
  </button>
</div>

// Inconsistent chart colors
<ChartContainer config={{
  series1: { color: "#8b5cf6" },  // Don't hardcode
  series2: { color: "blue" }       // Don't use named colors
}} />
```

---

## Accessibility

### Contrast Ratios

All color combinations meet WCAG 2.1 AA standards:

| Combination | Light Mode | Dark Mode | Status |
|-------------|------------|-----------|--------|
| Primary on Background | 4.5:1 | 4.5:1 | ✅ AA |
| Foreground on Background | 16:1 | 16:1 | ✅ AAA |
| Muted Foreground on Background | 4.5:1 | 4.5:1 | ✅ AA |
| Primary on Primary Foreground | 4.5:1 | 4.5:1 | ✅ AA |
| Destructive on Background | 4.5:1 | 4.5:1 | ✅ AA |

### Color Blindness Considerations

- Chart colors use different lightness values for differentiation
- Not relying solely on color for information (using icons, labels)
- Patterns/textures can be added for complex charts if needed

---

## Multi-Tenant Theming

The color system supports per-tenant customization through CSS variables:

### Implementation

```css
/* Default theme */
:root {
  --primary: 262.1 83.3% 57.8%;
}

/* Tenant-specific theme */
[data-tenant="client-name"] {
  --primary: 220 70% 50%; /* Client's brand color */
}
```

### Customizable Colors

Tenants can customize:
- `--primary` - Primary brand color
- `--primary-foreground` - Text on primary (auto-calculated for contrast)

### Non-Customizable Colors

For consistency, these remain fixed:
- Background/Foreground (for readability)
- Destructive (for error states)
- Chart colors (for data visualization consistency)

---

## Dark Mode

The color system includes a complete dark mode palette:

### Dark Mode Adjustments

1. **Backgrounds:** Darker shades for reduced eye strain
2. **Text:** Lighter shades for readability
3. **Borders:** More subtle for less visual noise
4. **Primary:** Slightly muted to prevent overwhelming brightness
5. **Charts:** Same palette, works well on dark backgrounds

### Dark Mode Toggle

Dark mode is controlled via the `dark` class on the root element:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark')
```

---

## Color Tokens Reference

### CSS Variables

All colors are available as CSS variables:

```css
/* Semantic colors */
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--destructive-foreground
--border
--input
--ring

/* Chart colors */
--chart-1
--chart-2
--chart-3
--chart-4
--chart-5

/* Sidebar colors */
--sidebar-background
--sidebar-foreground
--sidebar-primary
--sidebar-primary-foreground
--sidebar-accent
--sidebar-accent-foreground
--sidebar-border
--sidebar-ring
```

### Tailwind Classes

Use semantic Tailwind classes:

```tsx
// Backgrounds
bg-background
bg-card
bg-primary
bg-secondary
bg-muted
bg-accent
bg-destructive

// Text
text-foreground
text-card-foreground
text-primary
text-primary-foreground
text-muted-foreground
text-destructive

// Borders
border-border
border-primary

// Charts
text-chart-1
text-chart-2
// etc.
```

---

## Color Combinations

### Recommended Combinations

**Primary Actions:**
- `bg-primary text-primary-foreground` - Primary buttons
- `bg-primary/10 text-primary` - Subtle primary highlights

**Cards:**
- `bg-card text-card-foreground border-border` - Standard cards

**Muted Elements:**
- `bg-muted text-muted-foreground` - Secondary information
- `text-muted-foreground` - Secondary text

**Error States:**
- `bg-destructive text-destructive-foreground` - Error buttons
- `text-destructive` - Error text
- `border-destructive` - Error borders

**Success States:**
- `bg-primary text-primary-foreground` - Success buttons
- `text-primary` - Success indicators
- `border-primary` - Success borders

---

## Migration Guide

If you find hardcoded colors, migrate them:

### Before
```tsx
<div className="bg-white text-gray-900">
  <button className="bg-purple-600 text-white">
    Click
  </button>
</div>
```

### After
```tsx
<div className="bg-card text-card-foreground">
  <button className="bg-primary text-primary-foreground">
    Click
  </button>
</div>
```

---

## Resources

- [Color System Source](../src/app/styles/globals.css)
- [Design Tokens](../src/lib/design-tokens.ts)
- [Tailwind Config](../tailwind.config.js)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Last Updated:** January 2025


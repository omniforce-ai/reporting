# Design System Documentation

This document outlines the design system for the Omniforce Client Reporting Dashboard, built on [shadcn/ui](https://ui.shadcn.com) as the foundation.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Spacing System](#spacing-system)
3. [Typography](#typography)
4. [Colors](#colors)
5. [Components](#components)
6. [Usage Guidelines](#usage-guidelines)

---

## Design Principles

### 1. Consistency
- Use design tokens for all spacing, typography, and colors
- Follow component patterns established in shadcn/ui
- Maintain visual hierarchy through consistent sizing

### 2. Accessibility
- WCAG 2.1 AA compliance minimum
- Proper color contrast ratios
- Keyboard navigation support
- Screen reader friendly

### 3. Scalability
- Design tokens enable easy theming
- Component composition over duplication
- Type-safe design system

### 4. Performance
- Variable fonts for optimal loading
- CSS variables for runtime theming
- Minimal bundle size

---

## Spacing System

We use a **4px base unit system** (shadcn/ui standard) for consistent spacing throughout the application.

### Spacing Scale

| Token | Value | Pixels | Use Case |
|-------|-------|--------|----------|
| `0.5` | 0.125rem | 2px | Tight spacing, borders |
| `1` | 0.25rem | 4px | Minimal spacing |
| `2` | 0.5rem | 8px | Small gaps, form fields |
| `3` | 0.75rem | 12px | Input padding |
| `4` | 1rem | 16px | Standard spacing, card padding |
| `6` | 1.5rem | 24px | Card padding, section gaps |
| `8` | 2rem | 32px | Large gaps, page padding |
| `12` | 3rem | 48px | Section spacing |
| `16` | 4rem | 64px | Major section breaks |

### Usage Examples

```tsx
// ✅ Good - Using spacing tokens
<div className="p-4 gap-6">
  <Card className="p-6" />
</div>

// ❌ Bad - Arbitrary values
<div className="p-[17px] gap-[23px]">
  <Card className="p-[19px]" />
</div>
```

### Semantic Spacing

For common patterns, use semantic spacing tokens:

```tsx
import { semanticSpacing } from '@/lib/design-tokens';

// Card padding
<div className="p-6">  // semanticSpacing.cardPadding

// Form gaps
<div className="gap-4">  // semanticSpacing.formGap

// Section spacing
<div className="gap-8">  // semanticSpacing.sectionGap
```

---

## Typography

### Font Family

**Primary:** Inter Variable (system fallback)
- Modern, highly legible
- Variable font for optimal performance
- Excellent for UI and data display

**Monospace:** System monospace fonts
- Used for code, metrics, and technical data

### Type Scale

| Size | Font Size | Line Height | Use Case |
|------|-----------|-------------|----------|
| `xs` | 0.75rem (12px) | 1rem (16px) | Labels, captions |
| `sm` | 0.875rem (14px) | 1.25rem (20px) | Secondary text |
| `base` | 1rem (16px) | 1.5rem (24px) | Body text |
| `lg` | 1.125rem (18px) | 1.75rem (28px) | Large body text |
| `xl` | 1.25rem (20px) | 1.75rem (28px) | Small headings |
| `2xl` | 1.5rem (24px) | 2rem (32px) | Section headings |
| `3xl` | 1.875rem (30px) | 2.25rem (36px) | Page headings |
| `4xl` | 2.25rem (36px) | 2.5rem (40px) | Hero headings |

### Font Weights

- `normal` (400) - Body text
- `medium` (500) - Emphasis
- `semibold` (600) - Headings
- `bold` (700) - Strong emphasis

### Usage Examples

```tsx
// ✅ Good - Using typography scale
<h1 className="text-3xl font-semibold">Dashboard</h1>
<p className="text-base text-muted-foreground">Description</p>
<label className="text-sm font-medium">Field Label</label>

// ❌ Bad - Arbitrary sizes
<h1 className="text-[28px] font-[550]">Dashboard</h1>
```

### Typography Guidelines

1. **Hierarchy:** Use size and weight to establish clear hierarchy
2. **Readability:** Maintain minimum 16px for body text
3. **Line Length:** Keep lines between 45-75 characters
4. **Line Height:** Use provided line heights for optimal readability

---

## Colors

Colors are managed through CSS variables for theming support. The system uses a **simplified 3-color palette**: Primary (violet), Muted, and Destructive. All violet elements use the same primary color for consistency.

### Color Tokens

All colors use semantic naming:

- `background` - Main background
- `foreground` - Main text color
- `primary` - Primary brand color (violet/purple)
- `secondary` - Secondary elements
- `muted` - Muted backgrounds/text
- `accent` - Accent color
- `destructive` - Error/danger states
- `border` - Border color
- `card` - Card background
- `popover` - Popover/dropdown background

### Usage

```tsx
// ✅ Good - Using semantic color tokens
<div className="bg-card text-card-foreground border-border">
  <button className="bg-primary text-primary-foreground">
    Submit
  </button>
</div>

// ❌ Bad - Hardcoded colors
<div className="bg-white text-black border-gray-300">
  <button className="bg-[#8b5cf6] text-white">
    Submit
  </button>
</div>
```

### Chart Colors

**All chart colors use the same primary violet** for maximum brand consistency:

- `--chart-1` through `--chart-5` - All use the same primary violet color

For multiple data series, use different opacity levels or line styles to differentiate, rather than different colors.

### Color System Documentation

For complete color system documentation including:
- Full color palette
- Accessibility guidelines
- Multi-tenant theming
- Dark mode colors
- Chart color usage

See [`COLOR_SYSTEM.md`](./COLOR_SYSTEM.md).

---

## Components

### Component Library

We use [shadcn/ui](https://ui.shadcn.com) components as the foundation. All components are:

- **Copy-paste:** Components live in your codebase
- **Customizable:** Fully editable source code
- **Type-safe:** TypeScript throughout
- **Accessible:** Built with accessibility in mind

### Available Components

- **Layout:** Card, Separator, Sidebar
- **Forms:** Button, Input, Select, Checkbox, Label
- **Feedback:** Alert, Badge, Skeleton, Sonner (toast)
- **Overlays:** Dialog, Drawer, Popover, Tooltip
- **Navigation:** Breadcrumb, Tabs, Dropdown Menu
- **Data Display:** Table, Chart components, CampaignPerformanceTable, CampaignsTable

### Component Patterns

#### Card Pattern

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

#### Button Pattern

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="default">
  Primary Action
</Button>
<Button variant="outline" size="sm">
  Secondary Action
</Button>
```

### Custom Components

#### MetricCard

Displays key metrics with comparison data:

```tsx
<MetricCard
  title="Emails Processed"
  value="1,281"
  comparisonText="↑ +12% from prior period"
  icon={CheckCircleIcon}
/>
```

#### Chart Cards

Consistent chart card components:

- `AreaChartCard` - Area charts
- `LineChartCard` - Line charts
- `GaugeChartCard` - Gauge/progress charts
- `BarChartCard` - Bar charts

#### CampaignPerformanceTable

Displays campaign performance data in a table format with tooltips and color-coded performance indicators:

```tsx
<CampaignPerformanceTable
  title="Campaign Performance Leaderboard"
  description="Top campaigns by total replies"
  data={[
    { name: "Campaign A", value: 150, openRate: 25.5, replyRate: 12.3 },
    { name: "Campaign B", value: 120, openRate: 22.1, replyRate: 10.8 },
  ]}
  valueLabel="Replies"
/>
```

**Features:**
- **Tooltips:** Hover over any row to see detailed campaign metrics (name, value, open rate, reply rate)
- **Color Coding:** Left border color indicates performance level:
  - Top 30%: Primary color (100% opacity)
  - Middle 30-70%: Primary color (60% opacity)
  - Bottom 30%: Primary color (30% opacity)
- **Value Styling:** Values displayed in primary color with semibold font
- **Hover Effects:** Rows highlight with primary color background on hover
- **Auto-sorting:** Data automatically sorted by value (descending)

**Data Structure:**
```tsx
interface CampaignPerformanceData {
  name: string;
  value: number;
  openRate?: number;    // Optional - shown in tooltip if available
  replyRate?: number;    // Optional - shown in tooltip if available
}
```

**Design Notes:**
- Uses shadcn/ui Table components for consistency
- Follows primary color system for visual indicators
- Accessible with proper ARIA labels and keyboard navigation
- Responsive design with proper overflow handling

---

## Usage Guidelines

### Do's ✅

1. **Use design tokens** for spacing, typography, and colors
2. **Follow component patterns** from shadcn/ui
3. **Maintain consistency** across similar components
4. **Test accessibility** with keyboard navigation and screen readers
5. **Use semantic HTML** for proper structure

### Don'ts ❌

1. **Don't use arbitrary values** - Use tokens instead
2. **Don't hardcode colors** - Use CSS variables
3. **Don't skip spacing tokens** - Maintain visual rhythm
4. **Don't ignore accessibility** - Always test
5. **Don't duplicate components** - Compose instead

### Code Review Checklist

- [ ] Uses spacing tokens (p-4, gap-6, etc.)
- [ ] Uses typography scale (text-sm, text-base, etc.)
- [ ] Uses semantic color tokens (bg-card, text-foreground)
- [ ] Follows component patterns
- [ ] Accessible (keyboard nav, ARIA labels)
- [ ] Responsive (mobile-first approach)

---

## Multi-Tenant Theming

The design system supports per-tenant customization through:

1. **CSS Variables:** All colors use CSS variables
2. **Database:** Tenant `primaryColor` stored in database
3. **Runtime:** Colors can be updated at runtime

### Implementation

Tenant-specific colors are applied via CSS variables:

```css
:root {
  --primary: 262.1 83.3% 57.8%; /* Default */
}

[data-tenant="client-name"] {
  --primary: 220 70% 50%; /* Client-specific */
}
```

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Design Tokens File](../src/lib/design-tokens.ts)
- [Component Source](../src/components/ui)

---

## Contributing

When adding new components or patterns:

1. Follow existing component structure
2. Use design tokens
3. Document usage examples
4. Test accessibility
5. Update this documentation

---

**Last Updated:** January 2025


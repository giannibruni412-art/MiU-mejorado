---
name: Academic Clarity
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#584141'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#8c7071'
  outline-variant: '#e0bfbf'
  surface-tint: '#af2b3d'
  primary: '#78001d'
  on-primary: '#ffffff'
  primary-container: '#9b1b30'
  on-primary-container: '#ffacaf'
  inverse-primary: '#ffb3b5'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#612800'
  on-tertiary: '#ffffff'
  tertiary-container: '#853a00'
  on-tertiary-container: '#ffb185'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b5'
  on-primary-fixed: '#40000b'
  on-primary-fixed-variant: '#8e0f28'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb68e'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#763300'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an institutional, structured, and modern digital environment tailored for universities, catering equally to students, faculty, and administrative personnel. The aesthetic leans on contemporary academic minimalism: restrained, authoritative, clear, and devoid of superfluous decoration. 

Every view evokes precision, intellectual rigor, and institutional stability. The interface minimizes cognitive friction, allowing high-density data (schedules, grades, transcripts, administrative procedures) to be ingested with confidence and clarity. Contrast is deliberate and functional; information is structured through clear visual anchors, crisp structural lines, and dignified typography.

## Colors

The palette establishes institutional credibility through a deep academic crimson complemented by utilitarian secondary tones and neutral surfaces.

- **Primary (`#9B1B30`)**: Academic crimson / deep wine. Used for primary actions, primary navigation anchors, high-level headers, and active state indicators. Interaction hover transitions to `#7E1627`.
- **Secondary (`#059669`)**: Academic emerald. Assigned to validation, positive academic standing, approved statuses, and successful feedback loops.
- **Tertiary / Accent (`#B45309` / `#D97706`)**: Subtle warm gold/amber. Reserved for honorary notices, pending statuses, alerts, and distinguished markers.
- **Neutral & Surfaces**:
  - Canvas Background: `#F9FAFB`
  - Container Surfaces: `#FFFFFF`
  - Subtle Borders & Dividers: `#E5E7EB`
  - Primary Text: `#111827`
  - Secondary / Meta Text: `#6B7280`
  - Subdued / Placeholder: `#9CA3AF`

## Typography

Typographic hierarchy is achieved strictly with **Inter**, utilizing varying weight scales (400, 500, 600, 700) and optical line-height balance.

- Use tighter negative tracking (`-0.01em` to `-0.02em`) for headlines to produce a unified, editorial look.
- Data tables, course listings, and administrative lists must strictly use `body-md` and `body-sm` to maintain high scanability.
- Status badges and metadata tags utilize `label-sm` with slight uppercase tracking (`0.04em`) to establish crisp contrast against long running text.

## Layout & Spacing

The layout is built upon an 8pt base grid with a structured 12-column layout on desktop, transforming to 8 columns on tablet and 4 columns on mobile.

- **Desktop (>= 1024px)**: Fixed max-width workspace (`1280px` centered) or persistent left-rail navigation (`260px` width) paired with a responsive fluid canvas. Outer margins sit at `margin` (`2rem`) with `1.5rem` gutters.
- **Tablet (768px - 1023px)**: Collapsible sidebar navigation, `margin` of `1.5rem`, `1rem` gutters.
- **Mobile (< 768px)**: Single-column flow with persistent top header, `margin-mobile` of `1rem`, and stacked widgets.

## Elevation & Depth

This design system favors architectural flatness, low-contrast structural boundaries, and ultra-subtle tonal depth rather than heavy drop shadows:

- **Surface Separation**: Surfaces (`#FFFFFF`) are primarily distinguished from the foundation canvas (`#F9FAFB`) through a continuous, crisp border (`1px solid #E5E7EB`).
- **Elevation Level 1 (Default Cards, Data Panels)**: `border: 1px solid #E5E7EB; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04);`
- **Elevation Level 2 (Hovered Cards, Dropdowns, Flyouts)**: `border: 1px solid #E5E7EB; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);`
- **Elevation Level 3 (Modals, Slide-over Drawers)**: `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04);`
- **Backdrop Overlays**: Solid dark neutral tint with low opacity (`rgba(17, 24, 39, 0.45)`) combined with a minimal blur (`backdrop-filter: blur(2px)`).

## Shapes

To mirror academic precision, geometry follows a soft, tailored curve structure:
- **Base Geometry**: Form inputs, standard buttons, and small items employ `0.25rem` (4px).
- **Cards & Data Tables**: Containers and structural panels use `rounded-lg` (`0.5rem` / 8px).
- **Badges & Status Tags**: Compact elements utilize either `0.25rem` or fully rounded pill styles where explicit distinction from content cards is required.

## Components

### Mandatory Institutional Badge
- **Content**: `"Prototipo Académico No Oficial"`
- **Appearance**: Fixed or prominent header integration. Subtle border (`1px solid #B45309`), soft amber surface (`#FEF3C7`), text color `#92400E`, styled with `label-sm` tracking. Must be persistently visible in global headers or dashboard viewports to ensure clear provenance.

### Buttons
- **Primary**: Background `#9B1B30`, text `#FFFFFF`, border none, hover `#7E1627`, active scale 0.99. Focus ring `2px solid #9B1B30` offset by 2px.
- **Secondary / Outline**: Background `#FFFFFF`, text `#111827`, border `1px solid #E5E7EB`, hover background `#F9FAFB`.
- **Ghost**: Background transparent, text `#6B7280`, hover text `#111827`, hover background `#F3F4F6`.

### Cards & Panels
- Background `#FFFFFF`, border `1px solid #E5E7EB`, border-radius `0.5rem`, padding `1.5rem`.
- Header section separated by an optional light horizontal rule (`1px solid #F3F4F6`) or padding rhythm.

### Inputs & Form Controls
- Height 40px, background `#FFFFFF`, border `1px solid #E5E7EB`, border-radius `0.25rem`, text `#111827`, placeholder `#9CA3AF`.
- Focus state: Border color `#9B1B30`, subtle outline `1px solid #9B1B30`.
- Error state: Border color `#DC2626`.

### Chips & Academic Status Badges
- **Success / Passed / Enrolled**: Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`.
- **Pending / Warning**: Background `#FFFBEB`, text `#92400E`, border `1px solid #FDE68A`.
- **Danger / Failed / Inactive**: Background `#FEF2F2`, text `#991B1B`, border `1px solid #FECACA`.

### Academic Data Tables
- Flush structure with minimal row height (48px). Table headers use `label-md` with `#6B7280` text and `#F9FAFB` fill.
- Alternating subtle hovers (`#F9FAFB`) with clean divider lines (`1px solid #E5E7EB`).
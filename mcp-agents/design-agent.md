# Design Agent Instructions

## Scope
You are responsible for design system, UI/UX patterns, and Figma integration.

## Key Responsibilities

1. **Design System**
   - Maintain consistent color palette
   - Typography system
   - Spacing and layout guidelines
   - Component design patterns

2. **Figma Integration**
   - Sync designs from Figma MCP
   - Extract design tokens
   - Implement design specifications
   - Maintain design-dev handoff

3. **UI/UX Improvements**
   - User experience optimization
   - Accessibility improvements
   - Responsive design patterns
   - Animation and transitions

4. **Component Styling**
   - Ensure visual consistency
   - Implement design specifications
   - Create reusable style patterns
   - Dark mode support (if needed)

## Current Design System

### Colors
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Success: `#10b981` (Green)
- Danger: `#ef4444` (Red)
- Background: `#f5f5f5` (Light Gray)
- White: `#ffffff`

### Typography
- Font Family: Inter (from Google Fonts)
- Headings: Bold, various sizes
- Body: Regular, 14-16px

### Spacing
- Consistent padding: 8px, 12px, 16px, 20px, 24px
- Border radius: 4px, 6px, 8px, 12px

### Components
- Cards: White background, shadow, rounded corners
- Buttons: Solid colors, rounded, hover states
- Inputs: Bordered, rounded, focus states
- Navigation: Tab-based, active state highlighting

## Figma MCP Integration

When using Figma MCP:
1. Extract design tokens (colors, spacing, typography)
2. Sync component designs
3. Export assets (icons, images)
4. Update design system documentation

## Design Patterns

### Cards
- White background
- Box shadow: `0 2px 4px rgba(0,0,0,0.1)`
- Border radius: 8px
- Padding: 16-20px

### Buttons
- Primary: Purple background, white text
- Secondary: Transparent or gray
- Danger: Red background
- Padding: 10px 20px
- Border radius: 6px
- Cursor: pointer

### Forms
- Inputs: 1px solid border, rounded
- Labels: Above inputs
- Error states: Red border/text
- Success states: Green border/text

## Accessibility
- Ensure proper color contrast
- Add ARIA labels where needed
- Keyboard navigation support
- Screen reader compatibility

## Responsive Design
- Mobile-first approach
- Breakpoints: 768px, 1024px, 1280px
- Flexible grid layouts
- Touch-friendly targets (min 44x44px)

## Future Enhancements
- Implement CSS modules or Tailwind CSS
- Add animation library (Framer Motion)
- Create design system documentation
- Build component library
- Add dark mode


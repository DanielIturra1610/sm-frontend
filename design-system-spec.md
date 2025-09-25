# Stegmaier Management - Design System Specification

## **Design Philosophy**
Modern, minimalist, and technically sophisticated interface for industrial safety management. Inspired by tazki.cl's clean approach while maintaining Stegmaier's professional consulting identity.

## **Brand Identity Integration**

### **Logo System**
- **Primary Logo**: Stegmaier with blue accent and gray text
- **White Logo**: For dark backgrounds and headers
- **Color Extraction**: Blue (#00a8e6), Gray (#6b6b6b), Black (#333333)

### **Core Values Reflection**
- **Professional Consulting**: Clean, authoritative interface
- **Safety First**: Clear information hierarchy, no cognitive overload
- **Innovation**: Modern micro-interactions and smooth animations
- **Reliability**: Consistent patterns and predictable behaviors

## **Color System**

### **Primary Palette**
```css
--stegmaier-blue: #00a8e6
--stegmaier-blue-light: #33b8ea
--stegmaier-blue-dark: #0096d1
--stegmaier-gray: #6b6b6b
--stegmaier-gray-light: #f8f9fa
--stegmaier-gray-dark: #495057
--stegmaier-black: #212529
```

### **Semantic Colors**
```css
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

### **Background System**
```css
--bg-primary: #ffffff
--bg-secondary: #f8f9fa
--bg-tertiary: #e9ecef
--bg-dark: #1a1d23
--bg-gradient: linear-gradient(135deg, #00a8e6 0%, #0096d1 100%)
```

## **Typography Scale**

### **Font Family**
- **Primary**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **Monospace**: JetBrains Mono, Consolas, monospace

### **Type Scale**
```css
--text-xs: 0.75rem     /* 12px */
--text-sm: 0.875rem    /* 14px */
--text-base: 1rem      /* 16px */
--text-lg: 1.125rem    /* 18px */
--text-xl: 1.25rem     /* 20px */
--text-2xl: 1.5rem     /* 24px */
--text-3xl: 1.875rem   /* 30px */
--text-4xl: 2.25rem    /* 36px */
--text-5xl: 3rem       /* 48px */
```

### **Font Weights**
```css
--font-light: 300
--font-regular: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

## **Spacing System**

### **Scale (8px base)**
```css
--space-1: 0.25rem    /* 4px */
--space-2: 0.5rem     /* 8px */
--space-3: 0.75rem    /* 12px */
--space-4: 1rem       /* 16px */
--space-5: 1.25rem    /* 20px */
--space-6: 1.5rem     /* 24px */
--space-8: 2rem       /* 32px */
--space-10: 2.5rem    /* 40px */
--space-12: 3rem      /* 48px */
--space-16: 4rem      /* 64px */
--space-20: 5rem      /* 80px */
--space-24: 6rem      /* 96px */
```

## **Component Design Patterns**

### **Button System**
```css
/* Primary Button */
.btn-primary {
  background: var(--stegmaier-blue);
  color: white;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 168, 230, 0.2);
}

.btn-primary:hover {
  background: var(--stegmaier-blue-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 168, 230, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--stegmaier-blue);
  border: 1px solid var(--stegmaier-blue);
  border-radius: 8px;
  padding: 12px 24px;
}
```

### **Card System**
```css
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

### **Input System**
```css
.input {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: var(--stegmaier-blue);
  box-shadow: 0 0 0 3px rgba(0, 168, 230, 0.1);
  outline: none;
}
```

## **Layout Principles**

### **Grid System**
- **Container Max Width**: 1280px
- **Breakpoints**:
  - Mobile: 640px
  - Tablet: 768px
  - Desktop: 1024px
  - Large: 1280px
  - XL: 1536px

### **Navigation Patterns**
- **Header Height**: 80px
- **Sidebar Width**: 280px (collapsed: 80px)
- **Content Padding**: 24px desktop, 16px mobile

## **Animation & Micro-interactions**

### **Timing Functions**
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### **Standard Durations**
```css
--duration-fast: 150ms
--duration-normal: 200ms
--duration-slow: 300ms
--duration-slower: 500ms
```

### **Hover States**
- **Buttons**: Slight lift (2px) + shadow enhancement
- **Cards**: Subtle lift (2px) + shadow enhancement
- **Links**: Color transition + underline

## **Icon System**

### **Icon Library**: Lucide React
- **Size Scale**: 16px, 20px, 24px, 32px, 48px
- **Stroke Width**: 2px (standard), 1.5px (light), 2.5px (bold)
- **Style**: Consistent stroke-based icons

### **Icon Usage**
- **Navigation**: 20px
- **Buttons**: 16px
- **Cards**: 24px
- **Features**: 32px
- **Heroes**: 48px

## **Page Layout Templates**

### **Authentication Pages**
- **Split Layout**: Left content, right form
- **Background**: Subtle gradient or pattern
- **Form Container**: Centered card with logo
- **Max Width**: 400px form width

### **Dashboard Layout**
- **Header**: Logo + navigation + user menu
- **Sidebar**: Collapsible navigation
- **Main**: Content area with breadcrumbs
- **Footer**: Minimal with version info

### **Content Pages**
- **Header**: Page title + actions
- **Content**: Cards/tables with proper spacing
- **Modals**: Centered overlay with backdrop blur

## **Data Visualization**

### **Chart Colors**
```css
--chart-primary: #00a8e6
--chart-secondary: #10b981
--chart-tertiary: #f59e0b
--chart-quaternary: #ef4444
--chart-quinary: #8b5cf6
```

### **Table Design**
- **Header**: Background with slight gray tint
- **Rows**: Zebra striping on hover
- **Actions**: Right-aligned with consistent spacing

## **Accessibility Standards**

### **Color Contrast**
- **Text on White**: Minimum 4.5:1 ratio
- **Text on Blue**: White text for maximum contrast
- **Interactive Elements**: Focus states with blue outline

### **Typography**
- **Minimum Size**: 14px for body text
- **Line Height**: 1.5 for body, 1.2 for headlines
- **Letter Spacing**: Slight positive spacing for small text

## **Implementation Guidelines**

### **CSS Architecture**
- **Tailwind CSS**: Primary utility framework
- **CSS Variables**: For theme consistency
- **Component Classes**: For reusable patterns
- **Responsive First**: Mobile-first approach

### **React Patterns**
- **Compound Components**: For complex UI elements
- **Render Props**: For flexible data presentation
- **Context**: For theme and user preferences
- **Hooks**: For reusable stateful logic

### **Performance Considerations**
- **Critical CSS**: Inline above-the-fold styles
- **Font Loading**: Preload primary fonts
- **Image Optimization**: WebP with fallbacks
- **Animation Performance**: Use transform and opacity

## **Brand Applications**

### **Safety Management Context**
- **Emergency States**: Red color with urgency indicators
- **Safe States**: Green with checkmarks
- **Warning States**: Amber with attention icons
- **Information**: Blue with info icons

### **Professional Aesthetics**
- **Clean Data Presentation**: Minimal borders, clear hierarchy
- **Trustworthy Interface**: Consistent patterns, no surprises
- **Efficient Workflows**: Reduced cognitive load, clear CTAs

This design system ensures Stegmaier Management maintains a professional, modern, and cohesive user experience across all touchpoints while reflecting the company's expertise in industrial safety consulting.
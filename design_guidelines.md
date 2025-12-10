# Design Guidelines: Digital Pass Recruitment Management System

## Design Approach
**System Selected**: Microsoft Fluent Design System + Enterprise Application Patterns

**Rationale**: This is a utility-focused HR recruitment management system requiring clarity, efficiency, and professional credibility. The Microsoft Fluent aesthetic aligns with the requirement to appear as an enterprise-grade solution without Replit branding.

## Core Design Principles
1. **Minimalist Clarity**: Clean white interfaces with purposeful use of color only for status indicators and primary actions
2. **Information Hierarchy**: Dense data displays with clear visual organization for recruitment workflows
3. **Role-Based UI**: Three distinct interface experiences optimized for each user type's needs
4. **Professional Credibility**: Enterprise-grade aesthetics appropriate for HR management

## Typography System
- **Primary Font**: Segoe UI (Microsoft standard) or Inter (fallback)
- **Headings**: 
  - H1: 32px, semi-bold (Dashboard titles, page headers)
  - H2: 24px, semi-bold (Section headers, card titles)
  - H3: 18px, medium (Subsections, panel headers)
- **Body Text**: 14px, regular (Standard content, table data)
- **Small Text**: 12px, regular (Metadata, timestamps, secondary info)
- **Monospace**: 'SF Mono', Consolas for Pass IDs (RP-2025-001)

## Layout & Spacing System
**Tailwind Units**: Use 4, 6, 8, 12, 16 for consistent spacing
- Component padding: p-4 to p-6
- Section spacing: mb-8 to mb-12
- Card spacing: p-6
- Grid gaps: gap-4 to gap-6
- Container max-width: max-w-7xl with px-6

**Grid Patterns**:
- Dashboard cards: 3-column grid on desktop (grid-cols-3), 2-col tablet, 1-col mobile
- Data tables: Full-width responsive with horizontal scroll on mobile
- Sidebar navigation: 240px fixed width on desktop, collapsible on tablet/mobile

## Color Specifications
**Base**:
- Background: White (#FFFFFF)
- Surface: Very light grey (#F9FAFB, #F3F4F6) for cards and panels
- Borders: Subtle grey (#E5E7EB)

**Accents** (use sparingly):
- Primary Blue: #0078D4 (Microsoft blue) for primary CTAs, active states
- Success Green: #107C10 for completed/hired status
- Neutral Grey: #605E5C for secondary text and borders

**Status Color System**:
- Draft/Pending: Grey (#6B7280)
- Active/In Progress: Blue (#0078D4)
- Success/Hired: Green (#107C10)
- Warning/Hold: Amber (#F59E0B)
- Error/Rejected: Red (#DC2626)

## Component Library

### HR Admin Dashboard (Secret Room)
**Layout**: Fixed left sidebar (240px) + main content area
- **Sidebar Navigation**: Vertical menu with icons + labels, active state with blue accent bar
- **Dashboard Cards**: Metric cards showing total passes, active candidates, pending approvals with large numbers and trend indicators
- **Pass Table**: Data table with columns: Pass ID, Position, Department, Manager, Status, Priority, Actions
- **Action Buttons**: Primary blue buttons for "Create New Pass", secondary outlined buttons for filters

### Manager Portal
**Layout**: Top navigation bar + content area (no sidebar for simpler manager experience)
- **Pass Cards**: Card-based layout showing assigned recruitment passes with key metrics
- **Candidate List**: Clean table or card view with candidate photos (small circular avatars), name, status, score
- **Interview Scheduler**: Calendar-style interface with time slots

### Candidate Pass (View-Only)
**Layout**: Centered content, max-w-2xl, minimal chrome
- **Status Timeline**: Horizontal step indicator showing application progress
- **Application Details**: Single-column layout with clear sections for personal info, position details, interview schedules

### Shared Components
**Cards**: White background, subtle grey border, 8px border-radius, shadow-sm on hover
**Tables**: 
- Header row with grey background (#F9FAFB)
- Alternating row colors for readability
- Sticky headers on scroll
- Action icons in last column
**Forms**: 
- Input fields with grey borders, blue focus ring
- Labels above inputs (14px, medium weight)
- Validation messages in red below fields
**Buttons**:
- Primary: Blue background, white text, 8px border-radius, px-6 py-2.5
- Secondary: White background, blue border and text
- Ghost: No background, grey text, hover grey background
**Status Badges**: Small rounded pills with colored backgrounds, 12px text, px-3 py-1

### AI-Powered Features UI
**Chat Interface** (for AI assistant):
- Right sidebar panel (400px) or modal overlay
- Message bubbles: AI messages in light grey, user messages in white with blue border
- Tool execution indicators showing "Generating JD...", "Scoring candidates..."
**Score Display**: Percentage-based with color gradient (red → amber → green)

## Navigation Patterns
**Admin Dashboard**: 
- Top bar: Company logo (Ma Hawa), search, notifications, user profile
- Left sidebar: Dashboard, Passes, Candidates, Managers, Reports, Settings
**Manager Portal**:
- Top bar: Logo, "My Passes", "Candidates", "Calendar", profile
**Candidate Pass**:
- Minimal header with logo and application ID

## Data Visualization
- **Recruitment Funnel**: Horizontal bar chart showing candidate progression through stages
- **Department Distribution**: Simple donut chart with department colors
- **Timeline Views**: Gantt-style bars for interview scheduling
- Use subtle animations only for loading states and data updates

## Responsive Behavior
- Desktop (1280px+): Full layout with sidebars
- Tablet (768-1279px): Collapsible sidebar, 2-column grids
- Mobile (<768px): Single column, hamburger menu, bottom navigation for managers

## Images
No hero images required. This is a functional dashboard application. Use:
- Company logo (Ma Hawa wordmark) in top-left corner
- Circular candidate profile photos (40px diameter in lists, 80px in detail views)
- Empty state illustrations for "No candidates yet" screens (simple line art, grey)
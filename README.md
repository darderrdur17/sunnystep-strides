# Sunnystep AI Marketing Automation Platform

A comprehensive AI-powered marketing automation dashboard built with React, TypeScript, and Supabase. This platform enables businesses to orchestrate intelligent marketing campaigns across multiple channels with autonomous AI agents.

---

## 📋 Table of Contents

- [Features Overview](#features-overview)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Feature Documentation](#feature-documentation)
- [Architecture](#architecture)
- [Authentication](#authentication)
- [Database Schema](#database-schema)

---

## ✨ Features Overview

### 🎯 Core Dashboard Features

| Feature | Description |
|---------|-------------|
| **Overview Dashboard** | Real-time KPIs, revenue metrics, conversion rates, and agent status |
| **AI Agents** | 4 autonomous agents (Campaign, Abandoned Cart, Lifecycle, Creative) |
| **Predictive Analytics** | Revenue forecasting, churn prediction, and AI-recommended actions |
| **Real-time Activity** | Live agent decision monitoring with timeline visualization |
| **A/B Testing** | Statistical significance analysis with Z-test calculations |

### 📧 Campaign Management

| Feature | Description |
|---------|-------------|
| **Email Templates** | Drag-and-drop builder with AI-powered copy suggestions |
| **SMS Campaigns** | Template library, scheduling, and character tracking |
| **WhatsApp Campaigns** | Rich media support with delivery tracking |
| **Customer Journey** | Visual flow mapping with agent touchpoints |

### ⚙️ Configuration & Settings

| Feature | Description |
|---------|-------------|
| **Agent Configuration** | Channel preferences, frequency caps, confidence thresholds |
| **Profile Management** | Avatar upload, password change, 2FA settings |
| **User Settings** | Theme toggle, notifications, data export |
| **Guardrails** | Brand safety, compliance rules, human oversight triggers |

---

## 🛠 Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui components |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **State Management** | TanStack Query, React Context |
| **Backend** | Supabase (Auth, Database, Edge Functions, Realtime) |
| **Forms** | React Hook Form, Zod validation |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📖 Feature Documentation

### 1. Dashboard Overview (`/` → Overview tab)

The main dashboard provides a bird's-eye view of your marketing performance:

- **Welcome Banner**: Personalized greeting with daily revenue summary
- **KPI Cards**: Marketing revenue, conversion rate, cart recovery, active customers
- **Performance Chart**: Interactive area chart showing revenue vs conversions over time
- **Active Agents Summary**: Quick status view of top-performing agents
- **Campaign List**: Recent campaigns with status and performance metrics

### 2. AI Agents (`/` → AI Agents tab)

Manage and monitor your autonomous marketing agents:

| Agent | Purpose | Key Metrics |
|-------|---------|-------------|
| **Campaign Agent** | Orchestrates end-to-end campaign execution | Active campaigns, ROI multiplier |
| **Abandoned Cart Agent** | Recovers lost sales with personalized messaging | Recovery rate, revenue recovered |
| **Lifecycle Agent** | Manages customer lifecycle journeys | Retention rate, NPS score |
| **Creative Agent** | Generates and optimizes creative content | Creative variants, A/B lift |

**Agent Capabilities:**
- Toggle agent on/off
- View recent actions
- Monitor confidence scores
- Track attributed revenue

### 3. Agent Configuration (`/` → Configuration tab)

Fine-tune agent behavior with granular controls:

- **Channel Preferences**: Enable/disable Email, SMS, WhatsApp, Web Push
- **Frequency Caps**: Set maximum messages per hour/day
- **Confidence Thresholds**: Minimum confidence to take autonomous action
- **Max Actions/Day**: Daily action limits for budget control
- **Custom Settings**: Agent-specific parameters (JSON configuration)

### 4. Predictive Analytics (`/` → Predictive tab)

AI-powered forecasting and recommendations:

**Revenue Forecast:**
- Historical data visualization
- Projected revenue with confidence intervals
- Month-over-month trend analysis

**Churn Risk Analysis:**
- Customer risk scoring (0-100%)
- Value at risk calculations
- Recommended intervention actions
- Reason categorization (engagement, purchases, support issues)

**AI Recommendations:**
- Prioritized action list
- Impact projections
- Confidence scores
- Effort estimates (Low/Medium/High)

### 5. Real-time Agent Activity (`/` → Activity tab)

Live monitoring of agent decisions:

- **Live Status Banner**: Real-time connection indicator
- **Agent Stats Grid**: Per-agent action counts, success rates, revenue
- **Activity Timeline**: Chronological feed of all agent actions
- **Filtering**: Filter by agent type
- **Status Indicators**: Completed, pending, failed states

### 6. A/B Testing (`/` → A/B Testing tab)

Experiment management with statistical analysis:

**Test Configuration:**
- Test name, description, type
- Start/end dates
- Variant setup (control + variations)

**Statistical Analysis:**
- Z-test significance calculation
- Confidence level display
- Lift percentage
- Winner declaration

**Metrics Tracked:**
- Impressions
- Conversions
- Conversion rate
- Revenue per variant

### 7. Email Template Builder (`/` → Email Templates tab)

Visual email construction:

**Drag & Drop Blocks:**
- Header (with logo support)
- Text (rich content)
- Image (with alt text)
- Button (CTA with link)
- Divider (spacing)
- Social (social links)

**AI Copy Assistant:**
- Generate subject lines
- Improve body copy
- Personalization suggestions
- Tone adjustment

**Template Management:**
- Save/load templates
- Category organization
- Preview mode
- Send test emails

### 8. SMS/WhatsApp Campaign Builder (`/` → SMS/WhatsApp tab)

Multi-channel messaging:

**Template Library:**
- Pre-built templates by category
- Variable placeholders ({{name}}, {{link}})
- Channel-specific templates

**Message Composer:**
- Character count (160 for SMS, 1024 for WhatsApp)
- SMS segment calculator
- Media attachment support
- Link shortening

**Scheduling:**
- Immediate send
- Scheduled delivery
- Timezone handling

**Audience Targeting:**
- Predefined segments
- Custom segment creation
- Recipient count preview

### 9. Customer Journey (`/` → Customer Journey tab)

Visual customer flow mapping:

- **Journey Stages**: Awareness → Consideration → Purchase → Retention → Advocacy
- **Touchpoints**: Agent interactions at each stage
- **Conversion Rates**: Stage-to-stage progression
- **Drop-off Analysis**: Identify friction points

### 10. Analytics & Metrics (`/` → Analytics tab)

Deep performance insights:

**Channel Performance:**
- Revenue by channel (Email, SMS, WhatsApp, Web Push)
- Send volume tracking
- Conversion comparison

**Agent Contribution:**
- Pie chart showing revenue share per agent
- Historical trend lines

**Conversion Funnel:**
- Impressions → Clicks → Cart → Checkout → Purchase
- Drop-off visualization

**Automation Impact:**
- AI-automated vs manual campaign comparison
- Weekly trend analysis

### 11. Workflows (`/` → Workflows tab)

Automation flow examples:

- Visual workflow diagrams
- Trigger configuration
- Decision node setup
- Action sequencing
- Wait conditions

### 12. Guardrails & Compliance (`/` → Guardrails tab)

Safety and brand protection:

- **Budget Limits**: Daily/monthly spend caps
- **Frequency Controls**: Message fatigue prevention
- **Content Filters**: Brand guideline enforcement
- **Human Escalation**: Trigger conditions for manual review
- **Compliance Rules**: GDPR, CAN-SPAM adherence

### 13. System Architecture (`/` → Architecture tab)

Technical documentation:

- **Architecture Diagram**: Visual system overview
- **Tech Stack Panel**: Framework and tool details
- **Rollout Plan**: Implementation timeline
- **Integration Points**: API documentation

### 14. Profile Management (`/` → Profile tab)

User account settings:

- **Avatar Upload**: Profile picture management
- **Display Name**: Personalization
- **Email**: Account email
- **Password Change**: Security update
- **Two-Factor Auth**: Enhanced security toggle
- **Company/Role**: Organization details

### 15. Settings (`/` → Settings tab)

Application preferences:

- **Theme Toggle**: Light/dark mode
- **Notification Preferences**: Email, push, in-app toggles
- **Language Selection**: Localization
- **Timezone**: Reporting timezone
- **Data Export**: Download account data
- **Account Deletion**: GDPR compliance

---

## 🏗 Architecture

```
src/
├── components/
│   ├── dashboard/          # Feature components
│   │   ├── OverviewView.tsx
│   │   ├── AgentsView.tsx
│   │   ├── PredictiveAnalytics.tsx
│   │   ├── AgentActivityDashboard.tsx
│   │   ├── ABTestResults.tsx
│   │   ├── EmailTemplateBuilder.tsx
│   │   ├── SMSWhatsAppBuilder.tsx
│   │   ├── AnalyticsCharts.tsx
│   │   └── ...
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── ui/                 # shadcn/ui primitives
├── pages/
│   ├── Index.tsx           # Main dashboard
│   ├── Auth.tsx            # Login/signup
│   └── NotFound.tsx
├── integrations/
│   └── supabase/           # Backend integration
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
└── index.css               # Design system tokens
```

---

## 🔐 Authentication

The platform uses Supabase Auth with:

- **Email/Password**: Standard signup and login
- **Auto-confirm**: Emails are automatically confirmed for development
- **Profile Auto-creation**: User profiles created on signup
- **Session Persistence**: Automatic token refresh

---

## 🗄 Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile information |
| `campaigns` | Marketing campaign data |
| `ab_tests` | A/B test configurations |
| `ab_test_variants` | Test variant results |
| `agent_configurations` | Agent settings per user |
| `agent_notifications` | Real-time agent activity log |
| `email_templates` | Saved email designs |
| `customer_journey_events` | Journey tracking data |
| `user_settings` | User preferences |

### Row Level Security (RLS)

All tables implement RLS policies ensuring users can only access their own data.

---

## 📱 Responsive Design

The platform is fully responsive across:

- **Desktop**: Full sidebar, expanded layouts
- **Tablet**: Collapsible sidebar, adaptive grids
- **Mobile**: Bottom navigation, stacked layouts, touch-optimized

Key responsive features:
- Fluid typography scaling
- Adaptive grid columns (1-4 based on viewport)
- Mobile-friendly tables with horizontal scroll
- Touch-friendly button sizes
- Collapsible navigation

---

## 🎨 Design System

### Color Tokens

```css
--primary: 14 90% 58%     /* Coral - Sunnystep brand */
--accent: 42 95% 55%      /* Golden sunshine */
--success: 152 60% 45%    /* Healthy green */
--warning: 38 95% 55%     /* Warm amber */
--destructive: 0 72% 55%  /* Soft red */
```

### Typography

- **Display Font**: Outfit (headings)
- **Body Font**: Inter (content)

---

## 📝 License

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📧 Support

For questions or issues, please open a GitHub issue or contact the development team.

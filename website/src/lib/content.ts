export const site = {
  name: "Trivense",
  tagline: "Split expenses, made easy.",
  description:
    "Trivense helps travelers and groups manage shared expenses with boards, real-time sync, analytics, and smart budgets — built for India and beyond.",
  url: "https://trivense.app",
  supportEmail: "support@trivense.app",
};

export const features = [
  {
    title: "Expense boards",
    description:
      "Organize spending by trip, household, or project. Each board has its own budget and members.",
    icon: "grid",
  },
  {
    title: "Split & share",
    description:
      "Invite others with a share code or email. Everyone sees updates in real time.",
    icon: "users",
  },
  {
    title: "Smart analytics",
    description:
      "See where money goes with category breakdowns, trends, and period comparisons.",
    icon: "chart",
  },
  {
    title: "Budget alerts",
    description:
      "Set per-board budgets and get notified before you overspend on your next adventure.",
    icon: "bell",
  },
  {
    title: "Multi-currency",
    description:
      "Track expenses in INR and other currencies with localized formatting.",
    icon: "currency",
  },
  {
    title: "Secure cloud sync",
    description:
      "Your data is backed by Supabase with auth, row-level security, and realtime updates.",
    icon: "shield",
  },
];

export const steps = [
  {
    step: "01",
    title: "Create a board",
    description: "Start a board for your trip or group and set a per-person budget.",
  },
  {
    step: "02",
    title: "Add expenses",
    description: "Log spending with categories, payment method, and optional notes.",
  },
  {
    step: "03",
    title: "Invite & split",
    description: "Share the board so everyone stays aligned on who paid what.",
  },
  {
    step: "04",
    title: "Review insights",
    description: "Use analytics to understand spending and plan better next time.",
  },
];

export const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect to try Trivense on a single board.",
    features: [
      "1 expense board",
      "Weekly analytics",
      "Up to 3 custom categories",
      "Email sign-in",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "₹299",
    period: "/month",
    description: "For frequent travelers and groups who need more.",
    features: [
      "Unlimited boards",
      "Board sharing & invites",
      "Advanced analytics (all periods)",
      "Unlimited categories",
      "Export & backup",
      "Priority support",
    ],
    cta: "Go Premium",
    highlighted: true,
  },
  {
    name: "Premium Yearly",
    price: "₹2,499",
    period: "/year",
    description: "Best value — about ₹208/month billed annually.",
    features: [
      "Everything in Premium",
      "Save vs monthly billing",
      "Ideal for annual trip planning",
    ],
    cta: "Save with yearly",
    highlighted: false,
  },
];

export const faqs = [
  {
    q: "What is Trivense?",
    a: "Trivense is a mobile expense tracker designed for trips and shared spending. Create boards, add expenses, invite friends, and see analytics — all in one app.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Trivense uses Supabase for authentication and storage with row-level security. Only you and people you invite can access your boards.",
  },
  {
    q: "Can I use Trivense for free?",
    a: "Yes. The free plan includes one expense board, weekly analytics, and up to three custom categories. Upgrade when you need sharing and unlimited boards.",
  },
  {
    q: "How do I join a shared board?",
    a: "Ask the board owner for their share code or invite link. Open Trivense, tap Join board, and enter the code.",
  },
  {
    q: "When is the app available?",
    a: "Trivense is in active development. Join the waitlist below and we'll notify you when the next release is ready on iOS and Android.",
  },
];

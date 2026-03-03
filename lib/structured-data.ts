export const publicPricingTiers = [
  {
    name: "Starter",
    price: 0,
    priceDisplay: "$0",
    period: "",
    description: "Perfect for students and job seekers looking to stand out.",
    features: ["1 AI Portfolio", "1 AI Agent Clone", "100 AI Messages / mo", "Standard Templates"],
  },
  {
    name: "Pro",
    price: 19,
    priceDisplay: "$19",
    period: "/month",
    description: "Your 24/7 automated sales representative.",
    features: [
      "3 AI Portfolios",
      "3 AI Agents",
      "1,000 AI Messages / mo",
      "Google Calendar Integration",
      "Lead Capture & CRM",
      "Premium Templates",
      "Custom Domain Support",
    ],
    highlighted: true,
  },
  {
    name: "Agency",
    price: 49,
    priceDisplay: "$49",
    period: "/month",
    description: "Scale your portfolio business with power metrics.",
    features: [
      "10 AI Portfolios",
      "10 AI Agents",
      "10,000 AI Messages / mo",
      "Deep AI Analytics",
      "Webhook Integrations",
      "Priority Support",
    ],
  },
] as const;

export const productFaqs = [
  {
    question: "Can I use my own domain?",
    answer: "Yes! Our Pro and Agency plans allow you to connect a custom domain to your portfolio easily.",
  },
  {
    question: "What counts as an \"AI message\"?",
    answer:
      "Any time a visitor chats with your AI agent, it counts as one message. Testing the chat in your dashboard is also included in your limits.",
  },
  {
    question: "Is there a long-term commitment?",
    answer: "No, all plans are month-to-month and you can cancel anytime from your settings.",
  },
  {
    question: "Does the AI collect secure payment info?",
    answer:
      "No, our AI is trained to handle conversation and scheduling. Payments for your services should be handled via traditional links you provide or integrate.",
  },
  {
    question: "Which plan includes lead capture and CRM tools?",
    answer: "Lead Capture & CRM is included on Pro, and Agency includes everything in Pro plus advanced scale features.",
  },
  {
    question: "Can I upgrade or downgrade my plan later?",
    answer: "Yes. You can upgrade, downgrade, or cancel anytime with no hidden fees.",
  },
] as const;

export const softwareFeatureList = [
  "AI portfolio builder",
  "AI agent cloning",
  "Lead capture and CRM",
  "Google Calendar integration",
  "Custom domain support",
  "Deep AI analytics",
  "Webhook integrations",
] as const;

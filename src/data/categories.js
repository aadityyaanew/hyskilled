/**
 * Course categories. `hue`/`chroma` drive the generated cover art so every
 * category has a distinct but on-brand colour identity.
 * In production this comes from the backend / admin panel.
 */
export const categories = [
  {
    slug: "generative-ai",
    name: "Generative AI & LLMs",
    short: "Generative AI",
    icon: "Zap",
    description:
      "Build with large language models, RAG pipelines, agents and AI-powered products.",
    hue: 24,
    keywords: ["LLM", "RAG", "Agents", "Prompting"],
  },
  {
    slug: "data-science",
    name: "Data Science & Analytics",
    short: "Data Science",
    icon: "BarChart3",
    description:
      "Turn raw data into decisions with Python, SQL, statistics and visualisation.",
    hue: 350,
    keywords: ["Python", "SQL", "Pandas", "Power BI"],
  },
  {
    slug: "machine-learning",
    name: "Machine Learning & Deep Learning",
    short: "Machine Learning",
    icon: "BrainCircuit",
    description:
      "Master classical ML, neural networks and the math that powers modern AI.",
    hue: 12,
    keywords: ["scikit-learn", "PyTorch", "NLP", "Vision"],
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX & Product Design",
    short: "UI/UX Design",
    icon: "PenTool",
    description:
      "Design delightful, usable products — from research and wireframes to polished systems.",
    hue: 335,
    keywords: ["Figma", "Research", "Prototyping", "Systems"],
  },
  {
    slug: "web-development",
    name: "Web Development",
    short: "Web Development",
    icon: "Code2",
    description:
      "Ship modern, fast, full-stack web apps with React, Next.js, Node and databases.",
    hue: 40,
    keywords: ["React", "Next.js", "Node.js", "APIs"],
  },
  {
    slug: "mobile-development",
    name: "Mobile App Development",
    short: "App Development",
    icon: "Smartphone",
    description:
      "Build beautiful cross-platform iOS & Android apps from a single codebase.",
    hue: 18,
    keywords: ["Flutter", "Dart", "Firebase", "Publishing"],
  },
  {
    slug: "cloud-devops",
    name: "Cloud & DevOps",
    short: "Cloud & DevOps",
    icon: "Cloud",
    description:
      "Deploy, scale and automate on AWS with containers, CI/CD and infrastructure as code.",
    hue: 5,
    keywords: ["AWS", "Docker", "Kubernetes", "CI/CD"],
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    short: "Cybersecurity",
    icon: "ShieldCheck",
    description:
      "Learn to think like an attacker and defend systems with practical security skills.",
    hue: 358,
    keywords: ["Pentesting", "Networking", "OWASP", "Linux"],
  },
  {
    slug: "digital-marketing-seo-smo-ppc",
    name: "Digital Marketing SEO SMO PPC",
    short: "DIGITAL-MARKETING-SEO-SMO-PPC",
    icon: "Layers",
    description:
      "Master SEO, SEM, social media, and content marketing to drive growth.",
    hue: 24,
    keywords: ["SEO", "Social Media", "Ads", "Growth"],
  },
];

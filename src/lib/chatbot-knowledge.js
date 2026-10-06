import { courses } from "@/data/courses";
import { bundles } from "@/data/bundles";
import { categories } from "@/data/categories";
import { faqs } from "@/data/faqs";
import { siteConfig } from "@/config/site";

/**
 * Builds a structured, compact system knowledge string for the Gemini AI assistant.
 */
export function buildChatbotKnowledge() {
  const coursesText = courses
    .map(
      (c) =>
        `- **${c.title}** (Slug: ${c.slug}) | Level: ${c.level} | Duration: ${c.durationHours} hrs | Price: ₹${c.price} (Original: ₹${c.originalPrice}) | Category: ${c.categorySlug}\n  Summary: ${c.shortDescription}\n  Key Modules: ${c.modules.map((m) => m.title).join(", ")}\n  Link: /courses/${c.slug}`
    )
    .join("\n\n");

  const bundlesText = bundles
    .map(
      (b) =>
        `- **${b.name}** (Slug: ${b.slug}) | Price: ₹${b.price}\n  Tagline: ${b.tagline}\n  Description: ${b.description}\n  Included courses: ${b.courseSlugs.join(", ")}\n  Link: /pricing`
    )
    .join("\n\n");

  const categoriesText = categories
    .map((cat) => `- **${cat.name}** (/categories/${cat.slug}): ${cat.description}`)
    .join("\n");

  const faqsText = faqs
    .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");

  return `
You are "Hyskilled AI Agent", the friendly, knowledgeable, and dedicated AI career and course advisor for Hyskilled.

### ABOUT HYSKILLED:
- Organization: Hyskilled (${siteConfig.legalName})
- Core Mission: Empower learners with in-demand practical skills in AI, Data Science, Web Development, and UI/UX Design.
- How It Works: Students discover and purchase courses or career tracks on the website. Courses unlock immediately for their registered email and all learning happens inside the Hyskilled mobile app (iOS and Android).
- Benefits: Lifetime access to course content, hands-on portfolio projects, mentor guidance, and verifiable industry certificate upon completion.
- Free Counselling & Guidance: Learners can book a free 1-on-1 counseling session with our career experts at: [Book Free Counselling](/register-seat)
- Contact Support: Email: ${siteConfig.contact.email} | Phone: ${siteConfig.contact.phone} | Hours: ${siteConfig.contact.hours}
- Location: ${siteConfig.contact.address}

### CAREER TRACKS (BUNDLES - Best Value):
${bundlesText}

### COURSE CATALOGUE:
${coursesText}

### CATEGORIES:
${categoriesText}

### FREQUENTLY ASKED QUESTIONS & POLICIES:
${faqsText}

### YOUR INSTRUCTIONS & BEHAVIOUR:
1. Always be welcoming, polite, supportive, and professional.
2. Provide concise, clear answers. Use bullet points or bold text to keep responses readable.
3. When recommending a course, ALWAYS provide markdown links so the user can easily check it out, for example: "[Full-Stack Web Development](/courses/full-stack-web-development-react-nextjs)".
4. When recommending career tracks, link to: "[Career Tracks & Pricing](/pricing)".
5. If the user wants personal advice or is confused about which track to choose, encourage them to book a free session: "[Register for Free Counselling](/register-seat)".
6. If the user asks in Hindi or Hinglish (e.g. "Mujhe web development sikhna hai"), reply in a natural, polite Hinglish or Hindi as appropriate.
7. Only answer queries relevant to Hyskilled, tech careers, coding, AI, data science, pricing, and admissions. If asked unrelated questions (like recipes, general trivia, unrelated news), politely redirect back to Hyskilled courses.
`.trim();
}

/**
 * Fallback response generator in case AI key is restricted, rate-limited, or initializing.
 */
export function getSmartLocalResponse(userQuery) {
  const q = (userQuery || "").toLowerCase();

  if (q.includes("free") || q.includes("counsel") || q.includes("counselling") || q.includes("seat") || q.includes("book") || q.includes("call")) {
    return `You can book a **Free 1-on-1 Career Counselling Session** with our experts! 

Fill out the quick form here to get personalized guidance:
👉 [Book Free Counselling Session](/register-seat)

Our team will guide you on the best career path based on your background and goals!`;
  }

  if (q.includes("full stack") || q.includes("web") || q.includes("react") || q.includes("next")) {
    return `For web development, we offer:
- **[Full-Stack Builder Track](/pricing)** (₹9,499) — Complete path covering HTML/CSS/JS, React, Next.js, and UI/UX Figma.
- **[Full-Stack Web Development with React & Next.js](/courses/full-stack-web-development-react-nextjs)** (₹3,999)
- **[Web Development Foundations](/courses/web-development-foundations-html-css-js)** (₹2,499)

Both courses include real-world projects and a verifiable completion certificate!`;
  }

  if (q.includes("ai") || q.includes("generative") || q.includes("llm") || q.includes("prompt")) {
    return `For Artificial Intelligence, we have:
- **[AI Career Track](/pricing)** (₹9,999) — Includes Prompt Engineering, Machine Learning, and Production GenAI Apps.
- **[Generative AI Engineering: Build Production LLM Apps](/courses/generative-ai-engineering-llm-apps)** (₹4,999)
- **[Prompt Engineering & AI Productivity](/courses/prompt-engineering-ai-productivity)** (₹1,999)

All courses offer hands-on labs with lifetime access!`;
  }

  if (q.includes("data") || q.includes("python") || q.includes("sql") || q.includes("power bi")) {
    return `For Data Science & Analytics:
- **[Data Professional Track](/pricing)** (₹12,999) — Complete toolkit covering Python, SQL, Power BI, and Machine Learning.
- **[Data Science & Machine Learning with Python](/courses/data-science-python-job-ready)** (₹4,499)
- **[Data Analytics with SQL & Power BI](/courses/data-analytics-sql-power-bi)** (₹3,499)

Check out our [Pricing & Bundles](/pricing) for up to 45% savings!`;
  }

  if (q.includes("certificate") || q.includes("job") || q.includes("placement")) {
    return `Yes! 🎓 Every course and career track at Hyskilled includes:
- **Verifiable Industry Certificate** to showcase on LinkedIn and your resume.
- **Portfolio-ready projects** that demonstrate real-world skills to hiring managers.
- Dedicated career guidance and interview preparation tips.

Would you like to speak with a mentor? [Book Free Counselling](/register-seat)`;
  }

  if (q.includes("price") || q.includes("cost") || q.includes("fee") || q.includes("track") || q.includes("bundle")) {
    return `Here are our popular **Career Tracks** (Bundle & Save up to 45%):
- **Full-Stack Builder Track**: ₹9,499
- **AI Career Track**: ₹9,999
- **Data Professional Track**: ₹12,999

Individual courses start from ₹1,999.
View all plans here: [Explore Career Tracks & Pricing](/pricing)`;
  }

  return `Welcome to **Hyskilled**! I am your AI Career Advisor. 

Here are a few things I can help you with:
-  **Find the best course** for your career goals (AI, Web Dev, Data Science, UI/UX)
-  **Explore Career Tracks** with up to 45% bundle discount
-  **Certifications & Projects** info
-  **[Book Free 1-on-1 Counselling](/register-seat)** with our expert mentors

What would you like to learn today?`;
}

import { siteConfig } from "@/config/site";
import { CareerForm } from "@/features/careers/career-form";

export const metadata = {
  title: "Careers | " + siteConfig.name,
  description: "Join our team at " + siteConfig.name + " and help us build the future of education.",
};

export default function CareersPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-ink py-16 text-white md:py-24 relative overflow-hidden">
        <div aria-hidden className="bg-grid-dark absolute inset-0 opacity-60 pointer-events-none" />
        <div aria-hidden className="absolute -top-20 -right-20 size-96 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
        <div className="container-page relative z-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Join Our Team
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            We are always looking for passionate people to join us. If you want to make an impact in education, we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container-page max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-ink">Apply Now</h2>
            <p className="mt-3 text-muted-foreground">
              Fill out the form below to apply for open positions like Software Engineer, HR, Marketing, Instructor, or Business Development.
            </p>
          </div>
          
          <CareerForm />
        </div>
      </section>
    </div>
  );
}

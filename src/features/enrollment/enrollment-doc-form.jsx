"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  CheckCircle2, Upload, AlertCircle, Loader2, X,
  ChevronRight, ChevronLeft, FileText, User, MapPin,
  ShieldCheck, GraduationCap, Briefcase, CreditCard,
  ClipboardCheck, IndianRupee, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { cn } from "@/lib/utils";

// ─── Constants ──────────────────────────────────────────────────────────────

const QUALIFICATIONS = [
  "Intermediate / 12th",
  "Diploma",
  "Graduation",
  "Post-Graduation",
  "Other",
];

const CURRENT_STATUSES = [
  "Fresher / Student",
  "Working Professional",
  "Freelancer",
  "Career Break",
];

const ID_TYPES = [
  "Aadhaar Card",
  "Passport",
  "Driving Licence",
  "Voter ID",
];

const STEPS = [
  { id: "personal", label: "Personal",   icon: User },
  { id: "address",  label: "Address",    icon: MapPin },
  { id: "identity", label: "Identity",   icon: ShieldCheck },
  { id: "academic", label: "Academic",   icon: GraduationCap },
  { id: "status",   label: "Status",     icon: Briefcase },
  { id: "payment",  label: "Payment",    icon: CreditCard },
  { id: "declare",  label: "Declaration", icon: ClipboardCheck },
];

// ─── File Upload Field ───────────────────────────────────────────────────────

function FileUploadField({ label, hint, type, value, onChange, accept, required, error }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setUploadErr("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await fetch("/api/enrollment/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Upload failed.");
      onChange(data.url);
    } catch (err) {
      setUploadErr(err.message);
    } finally {
      setUploading(false);
    }
  }, [type, onChange]);

  const isImage = value && /\.(jpg|jpeg|png|webp)(\?|$)/i.test(value);
  const filename = value ? value.split("/").pop().split("?")[0].slice(0, 40) : "";

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm font-semibold text-ink">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-all",
          value
            ? "border-primary/50 bg-primary/5"
            : error || uploadErr
            ? "border-destructive/60 bg-destructive/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        {uploading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" /> Uploading document…
          </div>
        ) : value ? (
          <div className="flex items-center gap-3 w-full justify-center">
            {isImage ? (
              <img src={value} alt="Preview" className="size-12 rounded-xl object-cover border border-border" />
            ) : (
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>
            )}
            <div className="text-left max-w-[200px]">
              <p className="truncate text-xs font-semibold text-foreground">{filename}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <CheckCircle2 className="size-3" /> Uploaded successfully
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="ml-auto grid size-7 place-items-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <>
            <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Upload className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Click to upload or drag &amp; drop</p>
              <p className="text-xs text-muted-foreground">{accept || "JPG, PNG, PDF — max 10 MB"}</p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {(uploadErr || error) && (
        <p className="flex items-center gap-1 text-xs font-medium text-destructive">
          <AlertCircle className="size-3 shrink-0" /> {uploadErr || error}
        </p>
      )}
    </div>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ steps, current }) {
  return (
    <ol className="flex items-center justify-between gap-1 overflow-x-auto pb-2 px-1">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done = i < current;
        const active = i === current;

        return (
          <li key={step.id} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center gap-1 w-full sm:w-auto">
              <span
                className={cn(
                  "grid size-9 sm:size-10 place-items-center rounded-2xl border-2 transition-all font-semibold",
                  done   && "border-primary bg-primary text-primary-foreground shadow-sm",
                  active && "border-primary bg-primary/10 text-primary ring-4 ring-primary/10",
                  !done && !active && "border-border bg-card text-muted-foreground"
                )}
              >
                {done ? <CheckCircle2 className="size-4 sm:size-5" /> : <Icon className="size-4 sm:size-5" />}
              </span>
              <span className={cn(
                "hidden sm:block text-[11px] font-semibold whitespace-nowrap",
                active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "h-0.5 flex-1 mx-1.5 rounded-full transition-all min-w-3",
                i < current ? "bg-primary" : "bg-border"
              )} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ num, title, sub }) {
  return (
    <div className="flex items-start gap-3 border-b border-border pb-4 mb-6">
      <Badge variant="soft" className="mt-0.5 shrink-0 font-mono text-xs">{num}</Badge>
      <div>
        <h2 className="font-heading text-lg font-bold text-ink sm:text-xl">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground sm:text-sm">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Form ───────────────────────────────────────────────────────────────

export default function EnrollmentDocForm({
  orderId,
  initialCourse = "",
  initialCategory = "",
  totalFee: initialFee = "",
  paidAmount: initialPaid = "",
}) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [docId, setDocId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // 01 · Personal Details
    photoUrl: "",
    fullName: "",
    fatherName: "",
    dob: "",
    mobile: "",
    email: "",

    // 02 · Address
    country: "India",
    address: "",
    city: "",
    state: "",
    postalCode: "",

    // 03 · Identity Verification
    govtIdType: "Aadhaar Card",
    govtIdUrl: "",
    aadhaarNumber: "",

    // 04 · Academic Details
    highestQualification: "",
    institutionName: "",
    graduationYear: "",
    percentageCgpa: "",
    marksheetUrl: "",

    // 05 · Professional Details
    currentStatus: "Fresher / Student",
    currentCompany: "",
    designation: "",
    workExperienceYears: "",
    resumeUrl: "",

    // 06 · Fee & Course Details
    selectedCourse: initialCourse,
    selectedCategory: initialCategory,
    totalFee: initialFee,
    paidAmount: initialPaid,
    paymentRefId: "",
    receiptUrl: "",

    // 07 · Declaration & Undertaking
    declarationInfoTrue: false,
    declarationBatchAllocation: false,
    declarationCodeOfConduct: false,
    declarationRefundPolicy: false,
    digitalSignature: "",
  });

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  // Auto-filled submission date
  const todayFormatted = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // ── Validation ──────────────────────────────────────────────────────────

  function validateStep(idx) {
    const e = {};
    if (idx === 0) {
      if (!form.photoUrl)          e.photoUrl   = "Photograph is required.";
      if (!form.fullName.trim())   e.fullName   = "Full name is required.";
      if (!form.fatherName.trim()) e.fatherName = "Father's name is required.";
      if (!form.dob)               e.dob        = "Date of birth is required.";
      if (!form.mobile.trim())     e.mobile     = "Mobile number is required.";
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
                                   e.email      = "Valid email address is required.";
    }
    if (idx === 1) {
      if (!form.country.trim())    e.country    = "Country is required.";
      if (!form.address.trim())    e.address    = "Complete address is required.";
      if (!form.city.trim())       e.city       = "City is required.";
      if (!form.state.trim())      e.state      = "State / Province is required.";
      if (!form.postalCode.trim()) e.postalCode = "PIN / Postal code is required.";
    }
    if (idx === 2) {
      if (!form.govtIdUrl)         e.govtIdUrl  = "Government ID document is required.";
      if (!form.aadhaarNumber.trim()) e.aadhaarNumber = "Aadhaar number is required.";
    }
    if (idx === 3) {
      if (!form.highestQualification) e.highestQualification = "Please select highest qualification.";
      if (!form.institutionName.trim()) e.institutionName    = "Institution name is required.";
      if (!form.graduationYear.trim()) e.graduationYear      = "Year of passing is required.";
      if (!form.percentageCgpa.trim()) e.percentageCgpa      = "Percentage / CGPA is required.";
      if (!form.marksheetUrl)          e.marksheetUrl        = "Marksheet / Degree certificate is required.";
    }
    if (idx === 4) {
      if (!form.currentStatus)     e.currentStatus = "Please select current status.";
      if (!form.workExperienceYears) e.workExperienceYears = "Years of experience is required.";
      if (!form.currentCompany.trim()) e.currentCompany = "Company name is required.";
      if (!form.designation.trim()) e.designation = "Designation is required.";
      if (!form.resumeUrl) e.resumeUrl = "Resume / CV is required.";
    }
    if (idx === 5) {
      if (!String(form.selectedCourse).trim()) e.selectedCourse = "Course is required.";
      if (!String(form.selectedCategory).trim()) e.selectedCategory = "Category is required.";
      if (form.totalFee === "" || form.totalFee === null) e.totalFee = "Total fee is required.";
      if (form.paidAmount === "" || form.paidAmount === null) e.paidAmount = "Paid amount is required.";
      if (!form.paymentRefId.trim()) e.paymentRefId = "Payment Reference / Transaction ID is required.";
      if (!form.receiptUrl)          e.receiptUrl   = "Fee receipt / Payment screenshot is required.";
    }
    if (idx === 6) {
      if (!form.declarationInfoTrue)        e.declarationInfoTrue        = "Required to confirm accuracy.";
      if (!form.declarationBatchAllocation) e.declarationBatchAllocation = "Required to accept batch allocation terms.";
      if (!form.declarationCodeOfConduct)   e.declarationCodeOfConduct   = "Required to accept code of conduct.";
      if (!form.declarationRefundPolicy)    e.declarationRefundPolicy    = "Required to accept refund policy.";
      if (!form.digitalSignature.trim())    e.digitalSignature           = "Digital signature / Full name is required.";
    }
    return e;
  }

  function next() {
    const e = validateStep(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prev() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const finalErrors = validateStep(6);
    if (Object.keys(finalErrors).length) { setErrors(finalErrors); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const allAgreed =
        form.declarationInfoTrue &&
        form.declarationBatchAllocation &&
        form.declarationCodeOfConduct &&
        form.declarationRefundPolicy;

      const res = await fetch("/api/enrollment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          ...form,
          declarationAgreed: allAgreed,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Submission failed.");
      setDocId(data.docId);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success State ────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center shadow-soft max-w-xl mx-auto space-y-6">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
          <CheckCircle2 className="size-8" />
        </span>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold text-ink sm:text-3xl">
            Documentation Submitted!
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you, <strong>{form.fullName}</strong>. Your enrollment verification documents
            (Ref: <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-primary">#{docId}</code>)
            have been recorded.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">
            <span className="font-semibold">Batch Allocation Notice:</span> Batch allocation will take place only after{" "}
            <strong>100% of the applicable tuition fee</strong> has been paid and successfully verified.
            Our admissions team will contact you at <strong>{form.email}</strong> shortly.
          </p>
        </div>

        <div className="pt-2">
          <Button asChild variant="brand" size="lg" className="w-full">
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  const balance = Math.max(0, (Number(form.totalFee) || 0) - (Number(form.paidAmount) || 0));

  // ── Render Steps ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <StepIndicator steps={STEPS} current={step} />

      <form onSubmit={handleSubmit} noValidate>
        <div className="rounded-3xl border border-border bg-card shadow-soft overflow-hidden">

          {/* ── Step 0: Personal ───────────────────────────────────── */}
          {step === 0 && (
            <div className="p-6 sm:p-8 space-y-6">
              <SectionHeader
                num="01"
                title="Personal Details"
                sub="Provide your personal identification details"
              />

              <FileUploadField
                label="Photograph"
                hint="Upload a clear recent passport-size photo (JPG, PNG)"
                type="photo"
                value={form.photoUrl}
                onChange={set("photoUrl")}
                accept="image/jpeg,image/png,image/webp"
                required
                error={errors.photoUrl}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="fullName" label="Full Name" required error={errors.fullName}>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => set("fullName")(e.target.value)}
                    placeholder="As per Government ID"
                    aria-invalid={!!errors.fullName}
                  />
                </FormField>

                <FormField id="fatherName" label="Father's Name" required error={errors.fatherName}>
                  <Input
                    id="fatherName"
                    value={form.fatherName}
                    onChange={(e) => set("fatherName")(e.target.value)}
                    placeholder="Father's full name"
                    aria-invalid={!!errors.fatherName}
                  />
                </FormField>

                <FormField id="dob" label="Date of Birth" required error={errors.dob}>
                  <Input
                    id="dob"
                    type="date"
                    value={form.dob}
                    onChange={(e) => set("dob")(e.target.value)}
                    aria-invalid={!!errors.dob}
                  />
                </FormField>

                <FormField id="mobile" label="Mobile Number" required error={errors.mobile}>
                  <Input
                    id="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => set("mobile")(e.target.value)}
                    placeholder="+91 98765 43210"
                    aria-invalid={!!errors.mobile}
                  />
                </FormField>

                <div className="sm:col-span-2">
                  <FormField id="email" label="Email Address" required error={errors.email}>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email")(e.target.value)}
                      placeholder="name@example.com"
                      aria-invalid={!!errors.email}
                    />
                  </FormField>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Address ────────────────────────────────────── */}
          {step === 1 && (
            <div className="p-6 sm:p-8 space-y-6">
              <SectionHeader
                num="02"
                title="Address"
                sub="Your current residential address"
              />

              <FormField id="country" label="Country" required error={errors.country}>
                <Select value={form.country} onValueChange={set("country")}>
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="address" label="Complete Address" required error={errors.address}>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => set("address")(e.target.value)}
                  placeholder="Flat / House No., Street, Landmark, Area"
                  rows={3}
                  aria-invalid={!!errors.address}
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField id="city" label="City" required error={errors.city}>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => set("city")(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    aria-invalid={!!errors.city}
                  />
                </FormField>

                <FormField id="state" label="State / Province" required error={errors.state}>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => set("state")(e.target.value)}
                    placeholder="e.g. Karnataka"
                    aria-invalid={!!errors.state}
                  />
                </FormField>

                <FormField id="postalCode" label="PIN / Postal Code" required error={errors.postalCode}>
                  <Input
                    id="postalCode"
                    value={form.postalCode}
                    onChange={(e) => set("postalCode")(e.target.value)}
                    placeholder="e.g. 560001"
                    aria-invalid={!!errors.postalCode}
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* ── Step 2: Identity ───────────────────────────────────── */}
          {step === 2 && (
            <div className="p-6 sm:p-8 space-y-6">
              <SectionHeader
                num="03"
                title="Identity Verification"
                sub="Government-issued ID for enrollment verification"
              />

              <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  ID is collected solely for identity verification and enrollment purposes.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="govtIdType" label="Government ID Type" required>
                  <Select value={form.govtIdType} onValueChange={set("govtIdType")}>
                    <SelectTrigger id="govtIdType">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ID_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField id="aadhaarNumber" label="Aadhaar Number" required hint="12-digit number" error={errors.aadhaarNumber}>
                  <Input
                    id="aadhaarNumber"
                    value={form.aadhaarNumber}
                    onChange={(e) => set("aadhaarNumber")(e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={16}
                    aria-invalid={!!errors.aadhaarNumber}
                  />
                </FormField>
              </div>

              <FileUploadField
                label="Government ID Document"
                hint="Upload clear copy of Aadhaar / Passport / Driving Licence / Voter ID (PDF or image)"
                type="govt_id"
                value={form.govtIdUrl}
                onChange={set("govtIdUrl")}
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required
                error={errors.govtIdUrl}
              />
            </div>
          )}

          {/* ── Step 3: Academic ───────────────────────────────────── */}
          {step === 3 && (
            <div className="p-6 sm:p-8 space-y-6">
              <SectionHeader
                num="04"
                title="Academic Details"
                sub="Your educational background and credentials"
              />

              <FormField id="highestQualification" label="Highest Qualification" required error={errors.highestQualification}>
                <Select value={form.highestQualification} onValueChange={set("highestQualification")}>
                  <SelectTrigger id="highestQualification" aria-invalid={!!errors.highestQualification}>
                    <SelectValue placeholder="Select qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALIFICATIONS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <FormField id="graduationYear" label="Year of Passing" required error={errors.graduationYear}>
                    <Input
                      id="graduationYear"
                      value={form.graduationYear}
                      onChange={(e) => set("graduationYear")(e.target.value)}
                      placeholder="e.g. 2024"
                      aria-invalid={!!errors.graduationYear}
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-1">
                  <FormField id="percentageCgpa" label="Percentage / CGPA" required error={errors.percentageCgpa}>
                    <Input
                      id="percentageCgpa"
                      value={form.percentageCgpa}
                      onChange={(e) => set("percentageCgpa")(e.target.value)}
                      placeholder="e.g. 82% or 8.4 CGPA"
                      aria-invalid={!!errors.percentageCgpa}
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-1">
                  <FormField id="institutionName" label="College / University / School" required error={errors.institutionName}>
                    <Input
                      id="institutionName"
                      value={form.institutionName}
                      onChange={(e) => set("institutionName")(e.target.value)}
                      placeholder="Institution name"
                      aria-invalid={!!errors.institutionName}
                    />
                  </FormField>
                </div>
              </div>

              <FileUploadField
                label="Marksheet / Degree Certificate"
                hint="Upload marksheet or degree certificate (PDF or image, max 10 MB)"
                type="marksheet"
                value={form.marksheetUrl}
                onChange={set("marksheetUrl")}
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required
                error={errors.marksheetUrl}
              />
            </div>
          )}

          {/* ── Step 4: Current Status ─────────────────────────────── */}
          {step === 4 && (
            <div className="p-6 sm:p-8 space-y-6">
              <SectionHeader
                num="05"
                title="Professional Details"
                sub="Your current professional background"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="currentStatus" label="Current Status" required error={errors.currentStatus}>
                  <Select value={form.currentStatus} onValueChange={set("currentStatus")}>
                    <SelectTrigger id="currentStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField id="workExperienceYears" label="Years of Experience" required error={errors.workExperienceYears}>
                  <Select value={form.workExperienceYears} onValueChange={set("workExperienceYears")}>
                    <SelectTrigger id="workExperienceYears" aria-invalid={!!errors.workExperienceYears}>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0 – Fresher / None">0 – Fresher / None</SelectItem>
                      <SelectItem value="Less than 1 year">Less than 1 year</SelectItem>
                      <SelectItem value="1–2 years">1–2 years</SelectItem>
                      <SelectItem value="2–5 years">2–5 years</SelectItem>
                      <SelectItem value="5+ years">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField id="currentCompany" label="Company / Organization Name" required error={errors.currentCompany}>
                  <Input
                    id="currentCompany"
                    value={form.currentCompany}
                    onChange={(e) => set("currentCompany")(e.target.value)}
                    placeholder="e.g. Acme Tech"
                    aria-invalid={!!errors.currentCompany}
                  />
                </FormField>

                <FormField id="designation" label="Designation / Role" required error={errors.designation}>
                  <Input
                    id="designation"
                    value={form.designation}
                    onChange={(e) => set("designation")(e.target.value)}
                    placeholder="e.g. Junior Developer"
                    aria-invalid={!!errors.designation}
                  />
                </FormField>
              </div>

              <FileUploadField
                label="Resume / CV"
                hint="Upload resume (PDF, DOC, DOCX — max 10 MB)"
                type="resume"
                value={form.resumeUrl}
                onChange={set("resumeUrl")}
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
                error={errors.resumeUrl}
              />
            </div>
          )}

          {/* ── Step 5: Payment ────────────────────────────────────── */}
          {step === 5 && (
            <div className="p-6 sm:p-8 space-y-6">
              <SectionHeader
                num="06"
                title="Fee & Course Details"
                sub="Course payment and verification records"
              />

              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-800">
                  <span className="font-semibold">Important:</span> Batch allocation will take place only after{" "}
                  <strong>100% of the applicable tuition fee</strong> has been paid and successfully verified.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="selectedCourse" label="Course Selected" required error={errors.selectedCourse}>
                  <Input
                    id="selectedCourse"
                    value={form.selectedCourse}
                    onChange={(e) => set("selectedCourse")(e.target.value)}
                    placeholder="Enrolled Course"
                    aria-invalid={!!errors.selectedCourse}
                  />
                </FormField>

                <FormField id="selectedCategory" label="Category / Domain" required error={errors.selectedCategory}>
                  <Input
                    id="selectedCategory"
                    value={form.selectedCategory}
                    onChange={(e) => set("selectedCategory")(e.target.value)}
                    placeholder="e.g. Full Stack Development"
                    aria-invalid={!!errors.selectedCategory}
                  />
                </FormField>

                <FormField id="totalFee" label="Total Course Fee (₹)" required error={errors.totalFee}>
                  <Input
                    id="totalFee"
                    type="number"
                    min="0"
                    value={form.totalFee}
                    onChange={(e) => set("totalFee")(e.target.value)}
                    placeholder="0"
                    aria-invalid={!!errors.totalFee}
                  />
                </FormField>

                <FormField id="paidAmount" label="Amount Paid (₹)" required error={errors.paidAmount}>
                  <Input
                    id="paidAmount"
                    type="number"
                    min="0"
                    value={form.paidAmount}
                    onChange={(e) => set("paidAmount")(e.target.value)}
                    placeholder="0"
                    aria-invalid={!!errors.paidAmount}
                  />
                </FormField>
              </div>

              {/* Balance card */}
              <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-5 py-3.5">
                <span className="text-sm font-medium text-muted-foreground">Balance Due</span>
                <div className="flex items-center gap-1.5">
                  <IndianRupee className={cn("size-4", balance === 0 ? "text-emerald-600" : "text-amber-600")} />
                  <span className={cn("text-lg font-bold", balance === 0 ? "text-emerald-600" : "text-foreground")}>
                    {balance.toLocaleString("en-IN")}
                  </span>
                  {balance === 0 && Number(form.paidAmount) > 0 && (
                    <Badge variant="success" className="ml-2">100% Paid</Badge>
                  )}
                </div>
              </div>

              <FormField
                id="paymentRefId"
                label="Payment Reference / Transaction ID"
                required
                error={errors.paymentRefId}
                hint="Order ID, UTR number, or UPI reference number"
              >
                <Input
                  id="paymentRefId"
                  value={form.paymentRefId}
                  onChange={(e) => set("paymentRefId")(e.target.value)}
                  placeholder="e.g. pay_XXXXX / UTR 123456789"
                  aria-invalid={!!errors.paymentRefId}
                />
              </FormField>

              <FileUploadField
                label="Fee Receipt / Payment Screenshot"
                hint="Upload payment receipt, Cashfree/Razorpay confirmation, or bank screenshot"
                type="receipt"
                value={form.receiptUrl}
                onChange={set("receiptUrl")}
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required
                error={errors.receiptUrl}
              />
            </div>
          )}

          {/* ── Step 6: Declaration ────────────────────────────────── */}
          {step === 6 && (
            <div className="p-6 sm:p-8 space-y-6">
              <SectionHeader
                num="07"
                title="Declaration & Undertaking"
                sub="Please read and accept the mandatory declarations below"
              />

              {/* 4 Checkboxes */}
              <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-5 sm:p-6">
                {/* 1 */}
                <div className="space-y-1">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="dec1"
                      checked={form.declarationInfoTrue}
                      onCheckedChange={set("declarationInfoTrue")}
                      aria-invalid={!!errors.declarationInfoTrue}
                      className="mt-1"
                    />
                    <Label htmlFor="dec1" className="text-sm leading-relaxed cursor-pointer font-normal text-foreground">
                      I hereby declare that all information provided is true and accurate to the best of my knowledge. <span className="text-destructive font-semibold">*</span>
                    </Label>
                  </div>
                  {errors.declarationInfoTrue && (
                    <p className="text-xs font-medium text-destructive pl-7">{errors.declarationInfoTrue}</p>
                  )}
                </div>

                {/* 2 */}
                <div className="space-y-1">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="dec2"
                      checked={form.declarationBatchAllocation}
                      onCheckedChange={set("declarationBatchAllocation")}
                      aria-invalid={!!errors.declarationBatchAllocation}
                      className="mt-1"
                    />
                    <Label htmlFor="dec2" className="text-sm leading-relaxed cursor-pointer font-normal text-foreground">
                      I understand that batch allocation will only be made after 100% fee payment is verified. <span className="text-destructive font-semibold">*</span>
                    </Label>
                  </div>
                  {errors.declarationBatchAllocation && (
                    <p className="text-xs font-medium text-destructive pl-7">{errors.declarationBatchAllocation}</p>
                  )}
                </div>

                {/* 3 */}
                <div className="space-y-1">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="dec3"
                      checked={form.declarationCodeOfConduct}
                      onCheckedChange={set("declarationCodeOfConduct")}
                      aria-invalid={!!errors.declarationCodeOfConduct}
                      className="mt-1"
                    />
                    <Label htmlFor="dec3" className="text-sm leading-relaxed cursor-pointer font-normal text-foreground">
                      I agree to adhere to the code of conduct and academic policies of Hyskilled. <span className="text-destructive font-semibold">*</span>
                    </Label>
                  </div>
                  {errors.declarationCodeOfConduct && (
                    <p className="text-xs font-medium text-destructive pl-7">{errors.declarationCodeOfConduct}</p>
                  )}
                </div>

                {/* 4 */}
                <div className="space-y-1">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="dec4"
                      checked={form.declarationRefundPolicy}
                      onCheckedChange={set("declarationRefundPolicy")}
                      aria-invalid={!!errors.declarationRefundPolicy}
                      className="mt-1"
                    />
                    <Label htmlFor="dec4" className="text-sm leading-relaxed cursor-pointer font-normal text-foreground">
                      I understand that fees once paid are subject to the institute&apos;s refund policy. <span className="text-destructive font-semibold">*</span>
                    </Label>
                  </div>
                  {errors.declarationRefundPolicy && (
                    <p className="text-xs font-medium text-destructive pl-7">{errors.declarationRefundPolicy}</p>
                  )}
                </div>
              </div>

              {/* Date (Auto-filled) */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4 text-primary" />
                  <span className="font-medium">Date (Auto-filled)</span>
                </div>
                <span className="font-semibold text-foreground text-sm">{todayFormatted}</span>
              </div>

              {/* Digital Signature */}
              <FormField
                id="digitalSignature"
                label="Digital Signature / Full Name"
                required
                hint="Type your full legal name as your digital signature"
                error={errors.digitalSignature}
              >
                <Input
                  id="digitalSignature"
                  value={form.digitalSignature}
                  onChange={(e) => set("digitalSignature")(e.target.value)}
                  placeholder="Type your full name"
                  aria-invalid={!!errors.digitalSignature}
                />
              </FormField>

              {submitError && (
                <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" /> {submitError}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation Footer ─────────────────────────────────── */}
          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4 sm:px-8">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={prev}>
                <ChevronLeft className="size-4" /> Back
              </Button>
            ) : <span />}

            {step < STEPS.length - 1 ? (
              <Button type="button" variant="brand" onClick={next}>
                Continue <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="brand"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <><Loader2 className="animate-spin size-4" /> Submitting Documentation…</>
                ) : (
                  <><CheckCircle2 className="size-4" /> Complete Enrollment Documentation</>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

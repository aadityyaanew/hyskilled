"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Search, Filter, RefreshCw, Eye,
  CheckCircle2, XCircle, Clock, ExternalLink,
  ChevronLeft, ChevronRight, Loader2, X, AlertCircle,
  IndianRupee, User, MapPin, ShieldCheck, GraduationCap,
  Briefcase, CreditCard, ClipboardCheck, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatCurrency(v) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Number(v) || 0);
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    pending:  { variant: "warning",     label: "Pending",  Icon: Clock },
    verified: { variant: "success",     label: "Verified", Icon: CheckCircle2 },
    rejected: { variant: "destructive", label: "Rejected", Icon: XCircle },
    missing_docs: { variant: "secondary", label: "Missing Docs", Icon: AlertCircle },
  };
  const { variant, label, Icon } = map[status] || map.pending;
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="size-3" /> {label}
    </Badge>
  );
}

// ─── Detail Section ────────────────────────────────────────────────────────────

function DetailSection({ icon: Icon, title, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Icon className="size-3.5 text-primary" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, isEditing, onChange }) {
  if (!isEditing && !value) return null;
  return (
    <div className="flex justify-between gap-3 text-sm items-center">
      <span className="text-muted-foreground shrink-0">{label}</span>
      {isEditing ? (
        <Input 
          value={value || ""} 
          onChange={(e) => onChange && onChange(e.target.value)} 
          className="h-8 text-right max-w-[200px]" 
        />
      ) : (
        <span className="font-medium text-foreground text-right break-all">{value}</span>
      )}
    </div>
  );
}

function FileLink({ label, url }) {
  if (!url) return null;
  return (
    <div className="flex justify-between gap-3 text-sm items-center">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-primary font-semibold hover:underline text-xs"
      >
        View file <ExternalLink className="size-3" />
      </a>
    </div>
  );
}

// ─── Detail Dialog ─────────────────────────────────────────────────────────────

function DetailDialog({ doc, onClose, onUpdate }) {
  const [status, setStatus] = useState(doc.status);
  const [notes, setNotes] = useState(doc.admin_notes || "");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const handleCopyLink = () => {
    const link = `https://hyskilled.com/enrollment/${doc.order_id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success("Link copied to clipboard!");
  };
  
  const [formData, setFormData] = useState({
    full_name: doc.full_name || "",
    father_name: doc.father_name || "",
    dob: doc.dob || "",
    mobile: doc.mobile || "",
    email: doc.email || "",
    address: doc.address || "",
    city: doc.city || "",
    state: doc.state || "",
    postal_code: doc.postal_code || "",
    country: doc.country || "",
    govt_id_type: doc.govt_id_type || "",
    aadhaar_number: doc.aadhaar_number || "",
    highest_qualification: doc.highest_qualification || "",
    institution_name: doc.institution_name || "",
    graduation_year: doc.graduation_year || "",
    percentage_cgpa: doc.percentage_cgpa || "",
    current_status: doc.current_status || "",
    current_company: doc.current_company || "",
    designation: doc.designation || "",
    work_experience_years: doc.work_experience_years || "",
    selected_course: doc.selected_course || "",
    selected_category: doc.selected_category || "",
    total_fee: doc.total_fee || "",
    paid_amount: doc.paid_amount || "",
    payment_ref_id: doc.payment_ref_id || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { 
        status: status === "missing_docs" ? "pending" : status, 
        adminNotes: notes, 
        order_id: doc.order_id,
        ...formData 
      };
      const res = await fetch(`/api/admin/enrollment-docs/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update.");
      onUpdate(data.doc);
      toast.success(`Documentation marked as ${status}.`);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  const balance = isEditing
    ? (Number(formData.total_fee || 0) - Number(formData.paid_amount || 0))
    : (doc.balance !== undefined ? Number(doc.balance) : (Number(doc.total_fee || 0) - Number(doc.paid_amount || 0)));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-3 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground">Enrollment Doc</span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-xs bg-muted hover:bg-primary/10 text-primary transition-colors px-2 py-1 rounded-md border border-primary/20 shrink-0"
                title="Copy link to send to user"
              >
                #{doc.order_id}
                {copiedLink ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3 opacity-70 group-hover:opacity-100" />}
              </button>
              <StatusBadge status={doc.status} />
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="sm:ml-auto w-fit" 
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel Edit" : "Edit Details"}
            </Button>
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Order: {doc.order_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Photo */}
          {doc.photo_url && (
            <div className="flex justify-center">
              <img
                src={doc.photo_url}
                alt={doc.full_name}
                className="size-20 rounded-2xl object-cover border-2 border-border shadow-soft"
              />
            </div>
          )}

          <DetailSection icon={User} title="Personal Details">
            <DetailRow label="Full Name"    value={formData.full_name} isEditing={isEditing} onChange={(val) => handleChange("full_name", val)} />
            <DetailRow label="Father's Name" value={formData.father_name} isEditing={isEditing} onChange={(val) => handleChange("father_name", val)} />
            <DetailRow label="Date of Birth" value={formData.dob} isEditing={isEditing} onChange={(val) => handleChange("dob", val)} />
            <DetailRow label="Mobile"        value={formData.mobile} isEditing={isEditing} onChange={(val) => handleChange("mobile", val)} />
            <DetailRow label="Email"         value={formData.email} isEditing={isEditing} onChange={(val) => handleChange("email", val)} />
          </DetailSection>

          <DetailSection icon={MapPin} title="Address">
            <DetailRow label="Address"  value={formData.address} isEditing={isEditing} onChange={(val) => handleChange("address", val)} />
            <DetailRow label="City"     value={formData.city} isEditing={isEditing} onChange={(val) => handleChange("city", val)} />
            <DetailRow label="State"    value={formData.state} isEditing={isEditing} onChange={(val) => handleChange("state", val)} />
            <DetailRow label="PIN"      value={formData.postal_code} isEditing={isEditing} onChange={(val) => handleChange("postal_code", val)} />
            <DetailRow label="Country"  value={formData.country} isEditing={isEditing} onChange={(val) => handleChange("country", val)} />
          </DetailSection>

          <DetailSection icon={ShieldCheck} title="Identity">
            <DetailRow label="ID Type"       value={formData.govt_id_type} isEditing={isEditing} onChange={(val) => handleChange("govt_id_type", val)} />
            <DetailRow label="Aadhaar #"     value={formData.aadhaar_number} isEditing={isEditing} onChange={(val) => handleChange("aadhaar_number", val)} />
            <FileLink  label="Government ID" url={doc.govt_id_url} />
          </DetailSection>

          <DetailSection icon={GraduationCap} title="Academic">
            <DetailRow label="Qualification"   value={formData.highest_qualification} isEditing={isEditing} onChange={(val) => handleChange("highest_qualification", val)} />
            <DetailRow label="Institution"     value={formData.institution_name} isEditing={isEditing} onChange={(val) => handleChange("institution_name", val)} />
            <DetailRow label="Year of Passing" value={formData.graduation_year} isEditing={isEditing} onChange={(val) => handleChange("graduation_year", val)} />
            <DetailRow label="Percentage / CGPA" value={formData.percentage_cgpa} isEditing={isEditing} onChange={(val) => handleChange("percentage_cgpa", val)} />
            <FileLink  label="Marksheet / Degree" url={doc.marksheet_url} />
          </DetailSection>

          <DetailSection icon={Briefcase} title="Current Status">
            <DetailRow label="Status"      value={formData.current_status} isEditing={isEditing} onChange={(val) => handleChange("current_status", val)} />
            <DetailRow label="Company"     value={formData.current_company} isEditing={isEditing} onChange={(val) => handleChange("current_company", val)} />
            <DetailRow label="Designation" value={formData.designation} isEditing={isEditing} onChange={(val) => handleChange("designation", val)} />
            <DetailRow label="Experience"  value={formData.work_experience_years} isEditing={isEditing} onChange={(val) => handleChange("work_experience_years", val)} />
            <FileLink  label="Resume / CV" url={doc.resume_url} />
          </DetailSection>

          <DetailSection icon={CreditCard} title="Payment">
            <DetailRow label="Course"      value={isEditing ? formData.selected_course : doc.selected_course} isEditing={isEditing} onChange={(val) => handleChange("selected_course", val)} />
            <DetailRow label="Category"    value={isEditing ? formData.selected_category : doc.selected_category} isEditing={isEditing} onChange={(val) => handleChange("selected_category", val)} />
            <DetailRow label="Total Fee"   value={isEditing ? formData.total_fee : formatCurrency(doc.total_fee)} isEditing={isEditing} onChange={(val) => handleChange("total_fee", val)} />
            <DetailRow label="Paid"        value={isEditing ? formData.paid_amount : formatCurrency(doc.paid_amount)} isEditing={isEditing} onChange={(val) => handleChange("paid_amount", val)} />
            <div className="flex justify-between gap-3 text-sm items-center">
              <span className="text-muted-foreground shrink-0">Balance</span>
              <span className={cn("font-bold", balance === 0 ? "text-emerald-600" : "text-destructive")}>
                {formatCurrency(balance)}
                {balance === 0 && <Badge variant="success" className="ml-1.5">Paid</Badge>}
              </span>
            </div>
            <DetailRow label="Reference ID" value={isEditing ? formData.payment_ref_id : doc.payment_ref_id} isEditing={isEditing} onChange={(val) => handleChange("payment_ref_id", val)} />
            <FileLink  label="Receipt"      url={doc.receipt_url} />
          </DetailSection>

          <DetailSection icon={ClipboardCheck} title="Declaration">
            <DetailRow label="Agreed"            value={doc.declaration_agreed ? "Yes ✓" : "No"} />
            <DetailRow label="Digital Signature" value={doc.digital_signature} />
            <DetailRow label="Submitted At"      value={formatDate(doc.submitted_at)} />
          </DetailSection>

          {/* Admin Review */}
          {doc.status !== "missing_docs" || isEditing ? (
            <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Admin Review</h4>

              {/* Status selector */}
              <div className="flex gap-2">
                {[
                  { val: "pending",  label: "Pending",  v: "warning" },
                  { val: "verified", label: "Verified", v: "success" },
                  { val: "rejected", label: "Rejected", v: "destructive" },
                ].map(({ val, label, v }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setStatus(val)}
                    className={cn(
                      "flex-1 rounded-lg border py-2 text-xs font-semibold transition-all",
                      (status === val || (status === "missing_docs" && val === "pending"))
                        ? val === "verified"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : val === "rejected"
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal admin notes (optional)…"
                rows={3}
              />

              <Button
                onClick={handleSave}
                disabled={saving}
                variant="brand"
                className="w-full"
              >
                {saving ? <><Loader2 className="animate-spin" /> Saving…</> : "Save Review"}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center space-y-2">
              <AlertCircle className="size-6 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground text-sm">Documentation Pending</p>
              <p className="text-xs text-muted-foreground">The student has not yet submitted their enrollment documentation. You cannot review or verify it until they do.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color = "" }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <p className={cn("font-heading text-3xl font-bold", color)}>{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Main Manager ─────────────────────────────────────────────────────────────

export default function EnrollmentDocsManager() {
  const [docs, setDocs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter)  params.set("status", statusFilter);
      const res  = await fetch(`/api/admin/enrollment-docs?${params}`);
      const data = await res.json();
      if (data.success) {
        setDocs(data.docs);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchDocs(1); }, [fetchDocs]);

  function handleUpdate(updatedDoc) {
    setDocs((prev) => prev.map((d) => (d.id === updatedDoc.id ? { ...d, ...updatedDoc } : d)));
  }

  const pending  = docs.filter((d) => d.status === "pending").length;
  const verified = docs.filter((d) => d.status === "verified").length;
  const rejected = docs.filter((d) => d.status === "rejected").length;
  const missing  = docs.filter((d) => d.status === "missing_docs").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Enrollment Documentation
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Review and verify post-payment enrollment documentation submitted by students.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchDocs(pagination.page)}>
          <RefreshCw className="size-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Submissions" value={pagination.total} />
        <StatCard label="Missing Docs"      value={missing}          color="text-muted-foreground" />
        <StatCard label="Pending Review"    value={pending}          color="text-amber-600" />
        <StatCard label="Verified"          value={verified}         color="text-emerald-600" />
        <StatCard label="Rejected"          value={rejected}         color="text-destructive" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Search by name, email, mobile, order ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchDocs(1)}
          />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="size-4 shrink-0" />
          <select
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="missing_docs">Missing Docs</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Loading submissions…</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <FileText className="size-6" />
            </span>
            <p className="font-semibold text-foreground">No enrollment documentation found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Documents will appear here once students submit their documentation after payment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">ID / Order</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Course</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Submitted</th>
                  <th className="px-5 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {docs.map((doc) => {
                  const balance = Number(doc.balance) || 0;
                  return (
                    <tr key={doc.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {doc.id !== doc.order_id ? (
                          <>
                            <p className="font-mono font-semibold text-primary">#{doc.id}</p>
                            <p className="text-[11px] font-mono text-muted-foreground">{doc.order_id}</p>
                          </>
                        ) : (
                          <p className="font-mono font-semibold text-primary text-[13px]">#{doc.order_id}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-foreground">{doc.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">{doc.email}</p>
                        {doc.mobile && (
                          <p className="text-[10px] font-mono text-emerald-600">{doc.mobile}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-foreground">{doc.selected_course || "—"}</p>
                        {doc.selected_category && (
                          <p className="text-[11px] text-muted-foreground">{doc.selected_category}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-foreground">{formatCurrency(doc.paid_amount)}</p>
                        {balance > 0 ? (
                          <p className="text-[11px] text-destructive">Balance: {formatCurrency(balance)}</p>
                        ) : Number(doc.paid_amount) > 0 ? (
                          <Badge variant="success" className="mt-0.5">Full</Badge>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(doc.submitted_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDoc(doc)}
                        >
                          <Eye className="size-3.5" /> Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={pagination.page <= 1}
            onClick={() => fetchDocs(pagination.page - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchDocs(pagination.page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedDoc && (
        <DetailDialog
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

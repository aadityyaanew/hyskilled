"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Search, Mail, Phone, Loader2, Users, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUSES = [
  { value: "new", label: "New", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  { value: "contacted", label: "Contacted", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  { value: "scheduled", label: "Scheduled", cls: "bg-violet-50 text-violet-700 ring-violet-200" },
  { value: "converted", label: "Converted", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "closed", label: "Closed", cls: "bg-slate-100 text-slate-600 ring-slate-200" },
];
const statusMeta = (v) => STATUSES.find((s) => s.value === v) || STATUSES[0];

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${m.cls}`}>
      {m.label}
    </span>
  );
}

export function LeadsManager({ initialLeads = [] }) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const counts = useMemo(() => {
    const c = { all: leads.length };
    STATUSES.forEach((s) => (c[s.value] = leads.filter((l) => l.status === s.value).length));
    return c;
  }, [leads]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter !== "all" && l.status !== filter) return false;
      if (!q) return true;
      return [l.name, l.email, l.phone, l.course].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [leads, filter, search]);

  const patch = async (lead, body) => {
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Update failed.");
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? data.lead : l)));
    setSelected((s) => (s && s.id === lead.id ? data.lead : s));
    return data.lead;
  };

  const changeStatus = async (lead, status) => {
    try {
      await patch(lead, { status });
      toast.success("Status updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      await patch(selected, { admin_notes: adminNotes });
      toast.success("Notes saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/leads/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Delete failed.");
      setLeads((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      toast.success("Lead deleted");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const openLead = (lead) => {
    setSelected(lead);
    setAdminNotes(lead.admin_notes || "");
  };

  const selectCls =
    "h-8 rounded-lg border border-input bg-transparent px-2 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Users className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground">Session requests submitted from the website.</p>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[{ value: "all", label: "Total" }, ...STATUSES].map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`rounded-xl border bg-card p-4 text-left transition-all hover:shadow-sm ${
              filter === s.value ? "border-primary ring-1 ring-primary" : "border-border"
            }`}
          >
            <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-foreground">{counts[s.value]}</p>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone, course…"
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Inbox className="size-8" />
            <p className="text-sm">No leads found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visible.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <button onClick={() => openLead(l)} className="font-semibold text-foreground hover:text-primary hover:underline">
                        {l.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 hover:text-primary">
                        <Mail className="size-3" /> {l.email}
                      </a>
                      <a href={`tel:${l.phone}`} className="mt-1 flex items-center gap-1.5 hover:text-primary">
                        <Phone className="size-3" /> {l.phone}
                      </a>
                    </td>
                    <td className="max-w-[14rem] px-4 py-3 text-xs">{l.course || "—"}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">{formatDateTime(l.created_at)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={l.status}
                        onChange={(e) => changeStatus(l, e.target.value)}
                        className={selectCls}
                        aria-label="Lead status"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openLead(l)}>View</Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(l)} aria-label="Delete lead">
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">{selected.name}</DialogTitle>
                <DialogDescription>Received {formatDateTime(selected.created_at)}</DialogDescription>
              </DialogHeader>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-xs font-semibold text-muted-foreground">Email</dt><dd><a className="text-primary hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a></dd></div>
                <div><dt className="text-xs font-semibold text-muted-foreground">Phone</dt><dd><a className="text-primary hover:underline" href={`tel:${selected.phone}`}>{selected.phone}</a></dd></div>
                <div className="sm:col-span-2"><dt className="text-xs font-semibold text-muted-foreground">Course</dt><dd>{selected.course || "—"}</dd></div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold text-muted-foreground">Notes from lead</dt>
                  <dd className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3">{selected.notes || "—"}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs font-semibold text-muted-foreground">Status</dt>
                  <dd className="flex items-center gap-2">
                    <StatusBadge status={selected.status} />
                    <select value={selected.status} onChange={(e) => changeStatus(selected, e.target.value)} className={selectCls}>
                      {STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                    </select>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="mb-1 text-xs font-semibold text-muted-foreground">Internal follow-up notes</dt>
                  <dd><Textarea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Call outcome, next steps…" /></dd>
                </div>
              </dl>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                <Button variant="brand" onClick={saveNotes} disabled={saving}>
                  {saving && <Loader2 className="animate-spin" />} Save notes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete lead?</DialogTitle>
            <DialogDescription>
              This permanently removes {deleteTarget?.name}&apos;s request.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="animate-spin" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

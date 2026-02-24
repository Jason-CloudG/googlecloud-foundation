import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Cloud, Download, LogOut, Search } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  "New": "bg-primary/10 text-primary border-primary/20",
  "In Progress": "bg-accent/10 text-accent border-accent/20",
  "Completed": "bg-green-100 text-green-700 border-green-200",
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submissions, setSubmissions] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem("lz-submissions") || "[]");
  });

  const isLoggedIn = localStorage.getItem("lz-admin-auth") === "true";

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      const matchesSearch = !search ||
        s.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.contactPerson?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [submissions, search, statusFilter]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const updateStatus = (id: string, status: string) => {
    const updated = submissions.map(s => s.id === id ? { ...s, status } : s);
    setSubmissions(updated);
    localStorage.setItem("lz-submissions", JSON.stringify(updated));
    toast.success(`Status updated to ${status}`);
  };

  const exportData = (format: "csv" | "json") => {
    const data = filtered;
    if (data.length === 0) return;
    let content: string;
    let mimeType: string;
    let ext: string;

    if (format === "json") {
      content = JSON.stringify(data, null, 2);
      mimeType = "application/json";
      ext = "json";
    } else {
      const headers = Object.keys(data[0] || {});
      const rows = data.map(row => headers.map(h => {
        const val = row[h];
        return typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
      }).join(","));
      content = [headers.join(","), ...rows].join("\n");
      mimeType = "text/csv";
      ext = "csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `submissions.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = () => {
    localStorage.removeItem("lz-admin-auth");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
            <Cloud className="h-5 w-5 text-primary" />
            CloudFoundry Admin
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-foreground">Submissions</h1>
            <p className="text-muted-foreground">{submissions.length} total submissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportData("csv")} disabled={filtered.length === 0}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportData("json")} disabled={filtered.length === 0}>
              <Download className="mr-2 h-4 w-4" /> JSON
            </Button>
          </div>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search by company, contact, email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Environments</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      {submissions.length === 0 ? "No submissions yet." : "No results match your filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-foreground">{s.companyName || "—"}</TableCell>
                      <TableCell>{s.contactPerson || "—"}</TableCell>
                      <TableCell className="text-sm">{s.email || "—"}</TableCell>
                      <TableCell className="text-sm">{(s.environments || []).join(", ") || "—"}</TableCell>
                      <TableCell className="text-sm">{s.timeline || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[s.status] || ""}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Select value={s.status} onValueChange={v => updateStatus(s.id, v)}>
                          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;

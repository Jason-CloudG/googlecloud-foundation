import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Cloud, Download, LogOut, Search, FileCode, Loader2 } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  "New": "bg-primary/10 text-primary border-primary/20",
  "In Progress": "bg-accent/10 text-accent border-accent/20",
  "Completed": "bg-green-100 text-green-700 border-green-200",
  "TF Generated": "bg-blue-100 text-blue-700 border-blue-200",
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const isLoggedIn = localStorage.getItem("lz-admin-auth") === "true";

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchSubmissions();
    }
  }, [isLoggedIn]);

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      const matchesSearch = !search ||
        s.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.contact_person?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [submissions, search, statusFilter]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("submissions")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    toast.success(`Status updated to ${status}`);
  };

  const generateTerraform = async (id: string) => {
    setGeneratingId(id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-tfvars", {
        body: { submissionId: id },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message || "Terraform file generated successfully!");
        // Update local state
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: "TF Generated" } : s));
      } else {
        throw new Error(data?.error || "Unknown error");
      }
    } catch (err: any) {
      console.error("Terraform generation error:", err);
      toast.error(err.message || "Failed to generate Terraform file");
    } finally {
      setGeneratingId(null);
    }
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
                <SelectItem value="TF Generated">TF Generated</SelectItem>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading submissions...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      {submissions.length === 0 ? "No submissions yet." : "No results match your filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-foreground">{s.company_name || "—"}</TableCell>
                      <TableCell>{s.contact_person || "—"}</TableCell>
                      <TableCell className="text-sm">{s.email || "—"}</TableCell>
                      <TableCell className="text-sm">{(s.environments || []).join(", ") || "—"}</TableCell>
                      <TableCell className="text-sm">{s.timeline || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[s.status] || ""}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select value={s.status} onValueChange={v => updateStatus(s.id, v)}>
                            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="New">New</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="TF Generated">TF Generated</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateTerraform(s.id)}
                            disabled={generatingId === s.id}
                            className="whitespace-nowrap"
                          >
                            {generatingId === s.id ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <FileCode className="mr-1 h-3 w-3" />
                            )}
                            {generatingId === s.id ? "Generating..." : "Generate TF"}
                          </Button>
                        </div>
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

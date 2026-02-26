import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Cloud, LogIn } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic auth placeholder — will be replaced with Supabase auth
    if (email === "admin" && password === "12345") {
      localStorage.setItem("lz-admin-auth", "true");
      navigate("/admin");
      toast.success("Welcome back!");
    } else {
      toast.error("Invalid credentials. Use admin / 12345");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl text-foreground mb-2">
            <Cloud className="h-6 w-6 text-primary" />
            CloudFoundry
          </Link>
          <p className="text-muted-foreground text-sm">Admin Dashboard Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@cloudfoundry.dev" required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" size="lg">
            <LogIn className="mr-2 h-4 w-4" /> Sign In
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Demo credentials: admin@cloudfoundry.dev / admin123
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;

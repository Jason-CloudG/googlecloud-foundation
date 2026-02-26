import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-bold text-xl tracking-tight">
          Quadra
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#what" className="text-sm text-muted-foreground hover:text-foreground transition-colors">What is a Landing Zone?</a>
          <a href="#why" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Why Us</a>
          <a href="#process" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Process</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          <Link to="/wizard">
            <Button size="sm">Start Setup</Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-card border-b p-4 space-y-3">
          <a href="#what" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>What is a Landing Zone?</a>
          <a href="#why" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Why Us</a>
          <a href="#process" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Process</a>
          <a href="#faq" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>FAQ</a>
          <Link to="/wizard" onClick={() => setOpen(false)}>
            <Button size="sm" className="w-full">Start Setup</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

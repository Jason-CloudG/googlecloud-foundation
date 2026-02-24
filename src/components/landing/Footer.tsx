import { Cloud } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">CloudFoundry</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/wizard" className="hover:text-foreground transition-colors">Start Setup</Link>
            <a href="#what" className="hover:text-foreground transition-colors">About</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            <a href="mailto:contact@cloudfoundry.dev" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CloudFoundry. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

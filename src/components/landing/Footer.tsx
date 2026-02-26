import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-bold text-xl tracking-tight">Quadra</span>
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

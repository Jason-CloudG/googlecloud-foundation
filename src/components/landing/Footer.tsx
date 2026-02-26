import { Link } from "react-router-dom";
import googleCloudLogo from "@/assets/google-cloud-logo.svg";
import quadraLogo from "@/assets/quadra-logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={googleCloudLogo} alt="Google Cloud" className="h-6" />
            <span className="text-muted-foreground/40 text-xl font-light">|</span>
            <img src={quadraLogo} alt="Quadra" className="h-6 object-contain" />
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

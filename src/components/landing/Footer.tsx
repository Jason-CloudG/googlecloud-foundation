import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="https://www.gstatic.com/devrel-devsite/prod/v0e0f589edd85502a40d78d7d0825db8ea5ef3b99ab4070381ee86977c9168730/cloud/images/cloud-logo.svg" alt="Google Cloud" className="h-6" />
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

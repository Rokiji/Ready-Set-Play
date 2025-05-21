
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-game-primary mb-4">404</h1>
          <p className="text-2xl font-semibold mb-6">Oops! Page not found</p>
          <p className="text-gray-600 mb-8">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
          <Button asChild className="bg-game-primary hover:bg-game-primary/90">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NotFound;

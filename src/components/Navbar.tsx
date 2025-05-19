
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gamepad, LogIn, LogOut, UserPlus } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Navbar: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would validate credentials with a backend
    if (email && password) {
      setIsLoggedIn(true);
      setIsLoginOpen(false);
      toast.success("Successfully logged in!", {
        description: `Welcome back!`
      });
      // Clear form fields
      setEmail("");
      setPassword("");
    } else {
      toast.error("Login failed", {
        description: "Please check your email and password."
      });
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    if (username && email && password) {
      setIsLoggedIn(true);
      setIsSignupOpen(false);
      toast.success("Account created successfully!", {
        description: `Welcome, ${username}!`
      });
      // Clear form fields
      setUsername("");
      setEmail("");
      setPassword("");
    } else {
      toast.error("Signup failed", {
        description: "Please fill out all required fields."
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.info("You have been logged out.");
  };

  return (
    <nav className="bg-game-primary text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Gamepad size={28} className="text-game-secondary" />
          <h1 className="text-2xl font-bold">Ready, Set, Play</h1>
        </Link>
        
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/" className="hover:text-game-secondary transition-colors">Home</Link>
          <Link to="/games" className="hover:text-game-secondary transition-colors">Games</Link>
          <Link to="/music" className="hover:text-game-secondary transition-colors">Music</Link>
          <Link to="/about" className="hover:text-game-secondary transition-colors">About</Link>
        </div>
        
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:text-game-secondary"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:text-game-secondary"
                onClick={() => setIsLoginOpen(true)}
              >
                <LogIn className="mr-2 h-4 w-4" /> Log In
              </Button>
              <Button 
                className="bg-game-secondary hover:bg-game-secondary/90 text-game-background"
                onClick={() => setIsSignupOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Log In</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="example@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-game-primary hover:bg-game-primary/90">Log In</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Signup Dialog */}
      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Create an Account</DialogTitle>
            <DialogDescription>
              Fill out the form below to create your account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSignup}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="GameMaster" 
                  className="bg-background"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input 
                  id="signup-email" 
                  type="email" 
                  placeholder="example@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input 
                  id="signup-password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-game-secondary hover:bg-game-secondary/90 text-game-background">
                Create Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;

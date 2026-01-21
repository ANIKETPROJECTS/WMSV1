import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, ArrowRight } from "lucide-react";
import heroImg from "@assets/warehouse-hero.jpg"; // Placeholder path, we will use unsplash url in img tag

export default function Login() {
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary rounded-xl mb-4 shadow-xl shadow-primary/20">
              <Box className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">NexWMS</h1>
            <p className="text-muted-foreground">Enterprise Warehouse Management System</p>
          </div>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>
                Enter your credentials to access the dashboard
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="admin" required defaultValue="admin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required defaultValue="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full h-11 text-base group" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                  {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our <span className="underline hover:text-primary cursor-pointer">Terms of Service</span> and <span className="underline hover:text-primary cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
      
      <div className="hidden lg:block relative bg-muted">
        {/* Warehouse interior abstract background */}
        <img 
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Modern Warehouse" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-12 text-white">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              "NexWMS transformed our logistics operations. We've seen a 40% increase in efficiency since implementation."
            </p>
            <footer className="text-sm text-white/80 font-semibold mt-4">
              Sofia Davis, Logistics Director
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

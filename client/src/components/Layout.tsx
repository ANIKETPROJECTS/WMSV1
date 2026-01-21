import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  PackageMinus, 
  PackagePlus, 
  Boxes, 
  PieChart, 
  LogOut, 
  Menu,
  Box,
  User,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { setTheme, theme } = useTheme();
  
  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Inward", href: "/inward", icon: PackagePlus },
    { label: "Outward", href: "/outward", icon: PackageMinus },
    { label: "Inventory", href: "/inventory", icon: Boxes },
    { label: "MIS Reports", href: "/reports", icon: PieChart },
  ];

  const handleLogout = () => {
    setLocation("/");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="p-2 bg-primary rounded-lg">
          <Box className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl tracking-tight">NexWMS</h1>
          <p className="text-xs text-white/50">Warehouse System</p>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={`
              flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
              ${isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-medium" 
                : "text-white/70 hover:bg-white/10 hover:text-white"
              }
            `}>
              <item.icon className={`w-5 h-5 ${isActive ? "" : "opacity-70 group-hover:opacity-100"}`} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shadow-xl z-20">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b z-30 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-0 w-72">
              <NavContent />
            </SheetContent>
          </Sheet>
          <span className="font-display font-bold text-lg">NexWMS</span>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary">A</AvatarFallback>
        </Avatar>
      </div>

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 w-full max-w-[100vw] overflow-x-hidden">
        <header className="flex justify-between items-center mb-8">
          <div className="hidden md:block">
            <h2 className="text-2xl font-bold tracking-tight">
              {navItems.find(i => i.href === location)?.label || "Welcome"}
            </h2>
            <p className="text-muted-foreground text-sm">Manage your warehouse operations efficiently</p>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            
            <div className="hidden md:flex items-center gap-3 pl-4 border-l">
              <div className="text-right">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">Manager</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

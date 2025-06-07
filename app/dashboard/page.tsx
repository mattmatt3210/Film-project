"use client"

import { Button } from "@/components/ui/button";
import { User, Lock, LogOut, Home, Ticket, Settings, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">CinemaVault Staff</h1>
            <div className="relative">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setShowMenu(!showMenu)}
              >
                <User className="h-5 w-5 mr-2" />
                Staff Profile
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <Card className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-2 space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/20"
                      onClick={() => {
                        router.push("/change-password");
                        setShowMenu(false);
                      }}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/20"
                      onClick={() => {
                        router.push("/dashboard");
                        setShowMenu(false);
                      }}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/20"
                      onClick={() => {
                        router.push("/tickets");
                        setShowMenu(false);
                      }}
                    >
                      <Ticket className="h-4 w-4 mr-2" />
                      Manage Tickets
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/20"
                      onClick={() => {
                        router.push("/settings");
                        setShowMenu(false);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <div className="border-t border-white/10 my-1"></div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:bg-red-500/20"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Welcome to Staff Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Ticket className="h-8 w-8 text-purple-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Total Tickets</h3>
                      <p className="text-2xl font-bold text-purple-400">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <User className="h-8 w-8 text-blue-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Active Users</h3>
                      <p className="text-2xl font-bold text-blue-400">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Settings className="h-8 w-8 text-green-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">System Status</h3>
                      <p className="text-2xl font-bold text-green-400">Online</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
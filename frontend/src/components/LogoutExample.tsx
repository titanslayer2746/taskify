// Example component demonstrating logout functionality

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  LogoutButton,
  LogoutConfirmDialog,
  useLogout,
  useAutoLogout,
} from "./LogoutButton";
import { logoutService, logoutUtils } from "../services/logout";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  LogOut,
  Shield,
  Users,
  AlertTriangle,
  Settings,
  Trash2,
  Clock,
  Activity,
} from "lucide-react";

// Example component showing different logout options
export const LogoutExample: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { logout, logoutFromAllDevices, forceLogout, isLoading } = useLogout();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [logoutType, setLogoutType] = useState<
    "normal" | "all-devices" | "force"
  >("normal");

  // Enable auto logout after 30 minutes of inactivity
  useAutoLogout(30);

  const handleLogoutClick = (type: typeof logoutType) => {
    setLogoutType(type);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    try {
      switch (logoutType) {
        case "normal":
          await logout();
          break;
        case "all-devices":
          await logoutFromAllDevices();
          break;
        case "force":
          await forceLogout("User confirmed force logout");
          break;
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const handleServiceLogout = async (strategy: string) => {
    try {
      switch (strategy) {
        case "secure":
          await logoutUtils.secureLogout();
          break;
        case "emergency":
          await logoutUtils.emergencyLogout();
          break;
        case "security":
          await logoutUtils.securityLogout("Suspicious activity detected");
          break;
        case "maintenance":
          await logoutUtils.maintenanceLogout();
          break;
        case "account-deletion":
          await logoutUtils.accountDeletionLogout();
          break;
        default:
          await logoutService.logout();
      }
    } catch (error) {
      console.error("Service logout failed:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            Logout Example
          </CardTitle>
          <CardDescription>
            You are not authenticated. Please log in to see logout options.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Current User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{user?.name || "Unknown User"}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <Badge variant="secondary">Authenticated</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Basic Logout Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            Basic Logout Options
          </CardTitle>
          <CardDescription>
            Simple logout buttons with different configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <LogoutButton variant="default" />
            <LogoutButton variant="outline" />
            <LogoutButton variant="destructive" />
            <LogoutButton variant="ghost" />
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Dropdown Logout</h4>
            <LogoutButton
              showDropdown={true}
              variant="outline"
              onLogout={() => console.log("Normal logout")}
              onLogoutFromAllDevices={() =>
                console.log("Logout from all devices")
              }
              onForceLogout={() => console.log("Force logout")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Logout Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Advanced Logout Options
          </CardTitle>
          <CardDescription>
            Custom logout buttons with confirmation dialogs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleLogoutClick("normal")}
              disabled={isLoading}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoading ? "Logging out..." : "Normal Logout"}
            </Button>

            <Button
              onClick={() => handleLogoutClick("all-devices")}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <Users className="w-4 h-4 mr-2" />
              Logout All Devices
            </Button>

            <Button
              onClick={() => handleLogoutClick("force")}
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Force Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service-based Logout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Service-based Logout
          </CardTitle>
          <CardDescription>
            Using the logout service directly with different strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleServiceLogout("secure")}
              variant="outline"
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              Secure Logout
            </Button>

            <Button
              onClick={() => handleServiceLogout("emergency")}
              variant="destructive"
              className="w-full"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Logout
            </Button>

            <Button
              onClick={() => handleServiceLogout("security")}
              variant="destructive"
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security Logout
            </Button>

            <Button
              onClick={() => handleServiceLogout("maintenance")}
              variant="outline"
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              Maintenance Logout
            </Button>

            <Button
              onClick={() => handleServiceLogout("account-deletion")}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Account Deletion Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Auto Logout Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Auto Logout
          </CardTitle>
          <CardDescription>
            Automatic logout after 30 minutes of inactivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Active</Badge>
            <span className="text-sm text-gray-500">
              You will be automatically logged out after 30 minutes of
              inactivity
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirm}
        type={
          logoutType === "all-devices"
            ? "logout-all"
            : logoutType === "force"
            ? "force-logout"
            : "logout"
        }
        title={
          logoutType === "all-devices"
            ? "Logout from all devices?"
            : logoutType === "force"
            ? "Force logout?"
            : "Confirm logout?"
        }
        message={
          logoutType === "all-devices"
            ? "This will log you out from all your devices. You will need to log in again on each device."
            : logoutType === "force"
            ? "This will immediately log you out without calling the server. Use this for security concerns."
            : "Are you sure you want to logout?"
        }
        confirmText={
          logoutType === "all-devices"
            ? "Logout All Devices"
            : logoutType === "force"
            ? "Force Logout"
            : "Logout"
        }
      />
    </div>
  );
};

// Simple logout button for quick integration
export const SimpleLogoutButton: React.FC = () => {
  return <LogoutButton variant="outline" size="sm" />;
};

// Logout button with dropdown for more options
export const AdvancedLogoutButton: React.FC = () => {
  return <LogoutButton showDropdown={true} variant="outline" />;
};

// Auto logout component for session management
export const SessionManager: React.FC = () => {
  // Auto logout after 60 minutes
  useAutoLogout(60);

  return null; // This component doesn't render anything
};

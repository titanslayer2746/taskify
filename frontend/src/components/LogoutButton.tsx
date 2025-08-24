// Logout Button Component with multiple logout options

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, Shield, Users, AlertTriangle } from "lucide-react";

// Logout button props
interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showDropdown?: boolean;
  onLogout?: () => void;
  onLogoutFromAllDevices?: () => void;
  onForceLogout?: () => void;
}

// Simple logout button
export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = "outline",
  size = "default",
  className = "",
  showDropdown = false,
  onLogout,
  onLogoutFromAllDevices,
  onForceLogout,
}) => {
  const { logout, logoutFromAllDevices, forceLogout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onLogout?.();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutFromAllDevices = async () => {
    setIsLoggingOut(true);
    try {
      await logoutFromAllDevices();
      onLogoutFromAllDevices?.();
    } catch (error) {
      console.error("Logout from all devices failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleForceLogout = async () => {
    setIsLoggingOut(true);
    try {
      await forceLogout("User initiated force logout");
      onForceLogout?.();
    } catch (error) {
      console.error("Force logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (showDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            disabled={isLoading || isLoggingOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogoutFromAllDevices}>
            <Users className="w-4 h-4 mr-2" />
            Logout from all devices
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleForceLogout}
            className="text-red-600"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Force logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading || isLoggingOut}
    >
      <LogOut className="w-4 h-4 mr-2" />
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  );
};

// Logout confirmation dialog
interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "logout" | "logout-all" | "force-logout";
}

export const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Logout",
  message = "Are you sure you want to logout?",
  confirmText = "Logout",
  cancelText = "Cancel",
  type = "logout",
}) => {
  const { logout, logoutFromAllDevices, forceLogout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      switch (type) {
        case "logout":
          await logout();
          break;
        case "logout-all":
          await logoutFromAllDevices();
          break;
        case "force-logout":
          await forceLogout("User confirmed force logout");
          break;
      }
      onConfirm();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isLoggingOut}>
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoggingOut || isLoading}
          >
            {isLoggingOut ? "Logging out..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Logout utility hook
export const useLogout = () => {
  const { logout, logoutFromAllDevices, forceLogout, isLoading } = useAuth();

  const handleLogout = async (options?: {
    callApi?: boolean;
    redirectTo?: string;
    clearLocalData?: boolean;
    showNotification?: boolean;
  }) => {
    return await logout(options);
  };

  const handleLogoutFromAllDevices = async () => {
    return await logoutFromAllDevices();
  };

  const handleForceLogout = async (reason?: string) => {
    return await forceLogout(reason);
  };

  return {
    logout: handleLogout,
    logoutFromAllDevices: handleLogoutFromAllDevices,
    forceLogout: handleForceLogout,
    isLoading,
  };
};

// Auto logout hook for session timeout
export const useAutoLogout = (timeoutMinutes: number = 30) => {
  const { logout } = useLogout();

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout({
          callApi: true,
          redirectTo: "/signin",
          clearLocalData: true,
          showNotification: true,
        });
      }, timeoutMinutes * 60 * 1000);
    };

    const handleActivity = () => {
      resetTimeout();
    };

    // Reset timeout on user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timeout
    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [timeoutMinutes, logout]);
};

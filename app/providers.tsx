"use client";

import React from "react";
import { notification } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type NotificationContextType = (title: string, desc: string) => void;

const NotificationContext = React.createContext<NotificationContextType | null>(
  null
);

export const ThemeContext = React.createContext<{
  theme: string;
  toggleTheme: () => void;
} | null>(null);

const queryClient = new QueryClient();

export const useNotification = () => {
  const context = React.useContext(NotificationContext);

  if (context == null) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export default function Providers({ children }: { children: React.ReactNode }) {
  const [api, contextHolder] = notification.useNotification();

  // Initialize theme based on document's current class
  const [theme, setTheme] = React.useState<string>(() =>
    (typeof window !== "undefined" &&
      document.documentElement.classList.contains("dark")) ||
    false
      ? "dark"
      : "light"
  );

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    // Add or remove the dark class on the root element
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const openNotification: NotificationContextType = (title, desc) => {
    api.open({
      message: title,
      description: desc,
      duration: 3,
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationContext.Provider value={openNotification}>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          {contextHolder}
          {children}
        </ThemeContext.Provider>
      </NotificationContext.Provider>
    </QueryClientProvider>
  );
}

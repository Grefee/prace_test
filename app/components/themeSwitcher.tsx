"use client";

import React from "react";
import { Switch } from "antd";
import { ThemeContext } from "../providers";

export default function ThemeSwitcher() {
  const themeContext = React.useContext(ThemeContext);

  if (!themeContext) {
    return null; // Ensure context is available
  }

  const { theme, toggleTheme } = themeContext;

  return (
    <div className="flex flex-col items-center gap-1">
      <Switch
        className="w-fit"
        checked={theme === "dark"}
        onChange={toggleTheme}
      />
      <span>{theme === "light" ? "Light" : "Dark"}</span>
    </div>
  );
}
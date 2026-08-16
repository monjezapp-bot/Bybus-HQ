import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // لازم يطابق اسم المستودع على GitHub بالظبط، عشان الروابط تشتغل صح على GitHub Pages
  base: "/Bybus-HQ/",
});

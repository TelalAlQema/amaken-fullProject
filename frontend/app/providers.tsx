"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { AuthProvider } from "@/components/providers/AuthProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
}

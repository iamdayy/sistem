import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className={inter.className}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

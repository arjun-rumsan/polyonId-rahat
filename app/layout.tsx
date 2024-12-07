"use client";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WagmiProvider, useAccount } from "wagmi";
import { config } from "@/configs/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletOptions } from "@/components/wallet-option";
import { Account } from "@/components/account";
import { ConnectKitButton, ConnectKitProvider } from "connectkit";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useIsDonarPage } from "./hooks/is-donar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const queryClient = new QueryClient();
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isDonarPage } = useIsDonarPage();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider>
              <div className="flex flex-col h-screen bg-gray-100">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                  {!isDonarPage && <Sidebar />}
                  <main className="flex-1 p-8 overflow-y-auto">{children}</main>
                </div>
              </div>
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}

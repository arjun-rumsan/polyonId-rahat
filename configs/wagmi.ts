import { http, createConfig } from 'wagmi'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'
import { base, optimism, mainnet } from 'wagmi/chains'
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const projectId = '6870663979d47b901b7562f114b35bae'


export const config = createConfig(
    getDefaultConfig(
        {
            chains: [mainnet, base],
            connectors: [
                injected(),
                walletConnect({ projectId }),
                metaMask(),
                safe(),
            ],
            transports: {
                [mainnet.id]: http(),
                [base.id]: http(),
            },
            walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!!,
            appName: "Rahat-ETHINDIA",
            appDescription: "AppKit Example",
            appUrl: "https://reown.com/appkit", // origin must match your domain & subdomain

        }))


declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}
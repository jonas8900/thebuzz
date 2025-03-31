import Head from "next/head";
import { SWRConfig } from "swr"; 
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import '../styles/globals.css';
import { ThemeProvider } from "next-themes";

const fetcher = (url) => fetch(url).then((response) => response.json());

function App({ Component, pageProps }) {
    return (
        <SessionProvider session={pageProps.session}>
            <SWRConfig value={{ fetcher }}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    <Component {...pageProps} />
                </ThemeProvider>
            </SWRConfig>
        </SessionProvider> 
    );
}

// Defer Rendering mit dynamic import
export default dynamic(() => Promise.resolve(App), { ssr: false });

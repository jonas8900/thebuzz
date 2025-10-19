import Head from "next/head";
import { SWRConfig } from "swr"; 
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import '../styles/globals.css';
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import PlayerSocketProvider from "../components/context/playerContext";

const fetcher = (url) => fetch(url).then((response) => response.json());

function App({ Component, pageProps }) {


    return (
        <SessionProvider session={pageProps.session}>
            <SWRConfig value={{ fetcher }}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    <PlayerSocketProvider>
                        <Head>
                            <title>TheBuzz – Quiz</title>
                            <meta name="description" content="Starte spannende Buzzer-Runden und verwalte Fragen im Adminpanel." />
                        </Head>
                        <Component {...pageProps} />
                    </PlayerSocketProvider>
                </ThemeProvider>
            </SWRConfig>
        </SessionProvider> 
    );
}

export default dynamic(() => Promise.resolve(App), { ssr: false });

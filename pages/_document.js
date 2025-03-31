import Document, { Html, Head, Main, NextScript } from 'next/document';


export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="de" className="dark"> 
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        </Head>
        <body className="bg-gray-50 text-gray-900 antialiased dark:bg-gray-800 dark:text-gray-100">
            <Main />
            <NextScript />
        </body>
      </Html>
    );
  }
}

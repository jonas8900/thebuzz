import Document, { Html, Head, Main, NextScript } from 'next/document';


export default class MyDocument extends Document {
  render() {
      const description =
      'TheBuzz: Interaktive Quiz- & Buzzer-Plattform mit Adminpanel, Echtzeit-Statistiken und verschiedenen Spielmodi. Jetzt ausprobieren!';

    return (
      <Html lang="de" className="dark" title='html'> 
        <Head>
          <meta name="description" content={description} />
          <meta name="robots" content="index,follow" />
           <link rel="icon" href="/images/quizTime.jpg" sizes="any" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
          <link rel="canonical" href="https://www.thebuzz-quiz.de/" />
        </Head>
        <body className="bg-gray-50 text-gray-900 antialiased dark:bg-gray-800 dark:text-gray-100">
            <Main />
            <NextScript />
        </body>
      </Html>
    );
  }
}

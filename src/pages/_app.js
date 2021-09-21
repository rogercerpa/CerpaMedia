import Theme from '../styles/theme';
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Theme>
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
         <title>CerpaMedia</title>
          <link rel="icon" href="/favicon.ico" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <Component {...pageProps} />
      </Theme>
    </>
  );
}
 
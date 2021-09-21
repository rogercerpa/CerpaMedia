import Theme from '../styles/theme';
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Theme>
        <Head>
          <meta charset="UTF-8"/>
         <title>CerpaMedia</title>
          <link rel="icon" href="/favicon.ico" />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <Component {...pageProps} />
      </Theme>
    </>
  );
}
 
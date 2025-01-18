import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Irish_Grover, Joti_One } from '@next/font/google'

const irishGrover = Irish_Grover({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-irish-grover',
  });
  
  const jotiOne = Joti_One({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-joti-one',
  });
  

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={`${irishGrover.variable} ${jotiOne.variable}`}>
    <Component {...pageProps} />
        </main>
    );
}

export default MyApp

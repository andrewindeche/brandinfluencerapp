import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Irish_Grover, Joti_One ,Kaushan_Script} from "next/font/google"

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

  const kaushanScript = Kaushan_Script({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-kaushan-script',
  });
  

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={`${irishGrover.variable} ${jotiOne.variable} ${kaushanScript.variable}`}>
    <Component {...pageProps} />
        </main>
    );
}

export default MyApp

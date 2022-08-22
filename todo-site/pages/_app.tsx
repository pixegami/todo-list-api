import "../styles/globals.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="flex">
      <div className="mx-auto container max-w-lg my-16">
        <div className="border border-gray-300 p-8 rounded-md shadow-md">
          <Component {...pageProps} />
        </div>
      </div>
    </div>
  );
}

export default MyApp;

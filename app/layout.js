import { Epilogue, Noto_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Create Your Digital Name card in 5 seconds!",
  description: "Make sharing easier",
  manifest: "/manifest.json",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: "Create Your Digital Name card in 5 seconds!",
    description: "Make sharing easier",
    images: ['/favicon.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body
        className={`${epilogue.variable} ${notoSans.variable} font-sans antialiased bg-background-light text-[#121517] min-h-screen`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0JBCTS340J"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-0JBCTS340J');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}

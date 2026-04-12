import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "TTS App",
  description: "Text to Speech App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
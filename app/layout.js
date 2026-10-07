import "./globals.css";

export const metadata = {
  title: "India Industrial Intelligence",
  description: "Indian industrial investment and project intelligence",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

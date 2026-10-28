import "./globals.css";

export const metadata = {
  title: "BubaranMothai 2027 - Official Event Portal",
  description: "Sistem Pendaftaran dan E-Ticket Event BubaranMothai 2027",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
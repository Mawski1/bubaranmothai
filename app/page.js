import Link from 'next/link';
import { Sparkles, Ticket, ShieldCheck, ChevronRight, Flame, Trophy, Mail } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-amber-500/15 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-red-600/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Navbar */}
      <header className="max-w-6xl mx-auto w-full p-6 flex items-center justify-between border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Flame size={24} className="fill-slate-950" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-wider text-white">BUBARAN<span className="text-amber-500">MOTHAI</span></h1>
            <p className="text-[10px] text-slate-400 tracking-widest uppercase font-bold">Official Event Portal 2027</p>
          </div>
        </div>

        <Link
          href="/admin"
          className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:text-amber-400 transition flex items-center gap-2 shadow-sm"
        >
          <ShieldCheck size={16} className="text-amber-400" /> Portal Panitia
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto w-full px-6 py-16 text-center relative z-10 my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-6 shadow-inner">
          <Sparkles size={14} /> The Biggest Modification & Gathering Event
        </div>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight mb-6">
          REGISTRASI PESERTA <br />
          <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-200 bg-clip-text text-transparent drop-shadow-sm">
            BUBARAN MOTHAI 2027
          </span>
        </h2>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Amankan slot kendaraanmu sekarang! Dapatkan E-Ticket berteknologi QR Code untuk verifikasi instan dan kupon undian doorprize di lokasi acara.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          <Link
            href="/register"
            className="group relative p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-amber-500/40 hover:border-amber-400 transition-all duration-300 shadow-xl hover:shadow-amber-500/10 text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
                <Trophy size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 flex items-center justify-between">
                Daftar Kontes / Display <ChevronRight size={18} className="text-amber-400 group-hover:translate-x-1 transition" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Daftarkan motor modifikasi terbaikmu ke kategori Display atau VIP.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
              Mulai Pendaftaran &rarr;
            </div>
          </Link>

          <Link
            href="/ticket-check"
            className="group relative p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mb-4 group-hover:scale-110 transition">
                <Ticket size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 flex items-center justify-between">
                Cek E-Ticket QR <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cek status ACC panitia dan unduh E-Ticket QR Code peserta.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Lihat Tiket Saya &rarr;
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full p-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-900/80 relative z-10 gap-2">
        <p>&copy; {new Date().getFullYear()} BubaranMothai 2027. All rights reserved.</p>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Mail size={14} className="text-amber-400" />
          <span>bubaranmothaii@gmail.com</span>
        </div>
      </footer>
    </div>
  );
}
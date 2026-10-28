'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { ArrowLeft, Search, Ticket, CheckCircle2, Clock, XCircle } from 'lucide-react';

function TicketContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchTicket = async (queryText) => {
    if (!queryText) return;
    setLoading(true);
    setSearched(true);

    try {
      const qRef = collection(db, 'registrations');
      let q = query(qRef, where('ticket_code', '==', queryText.trim()));
      let snapshot = await getDocs(q);

      if (snapshot.empty) {
        q = query(qRef, where('license_plate', '==', queryText.trim().toUpperCase()));
        snapshot = await getDocs(q);
      }

      if (!snapshot.empty) {
        setTicketData({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setTicketData(null);
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
      setTicketData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) fetchTicket(initialQuery);
  }, [initialQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition"
        >
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>

        {/* Search Box */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h1 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Ticket className="text-amber-400" size={22} /> Cek Status & E-Ticket
          </h1>
          <p className="text-xs text-slate-400 mb-4">Masukkan Kode Tiket atau Plat Nomor kendaraan anda.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchTicket(searchQuery);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Contoh: BM-7K9M atau B 1234 ABC"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-amber-500 transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition cursor-pointer"
            >
              Cek
            </button>
          </form>
        </div>

        {loading && <div className="text-center py-6 text-slate-400 text-sm animate-pulse">Mencari data tiket ke database...</div>}

        {searched && !loading && !ticketData && (
          <div className="bg-red-950/40 border border-red-500/50 text-red-300 p-4 rounded-xl text-center text-sm">
            Data pendaftaran tidak ditemukan. Pastikan Plat Nomor atau Kode Tiket sudah benar.
          </div>
        )}

        {/* E-Ticket Display */}
        {ticketData && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 p-6 text-center relative">
              <p className="text-[10px] font-black tracking-widest uppercase opacity-80">BubaranMothai 2027 Pass</p>
              <h2 className="text-2xl font-black tracking-tight mt-0.5">BUBARAN MOTHAI</h2>
            </div>

            <div className="p-6 text-center space-y-5">
              <div>
                {ticketData.status === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={14} /> STATUS: APPROVED (ACC)
                  </span>
                )}
                {ticketData.status === 'PENDING' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                    <Clock size={14} /> STATUS: MENUNGGU VERIFIKASI
                  </span>
                )}
                {ticketData.status === 'REJECTED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                    <XCircle size={14} /> STATUS: DITOLAK
                  </span>
                )}
              </div>

              {ticketData.status === 'APPROVED' ? (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 inline-block shadow-inner">
                  <QRCodeSVG value={ticketData.ticket_code} size={180} className="mx-auto" />
                  <p className="mt-3 text-xs font-mono font-bold tracking-widest text-amber-400">{ticketData.ticket_code}</p>
                </div>
              ) : (
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs text-slate-400">
                  E-Ticket QR Code akan diterbitkan otomatis setelah diverifikasi oleh panitia.
                </div>
              )}

              <div className="text-left bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between"><span className="text-slate-400">Nama:</span> <strong className="text-white">{ticketData.full_name}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Plat Nomor:</span> <strong className="text-amber-400 font-mono">{ticketData.license_plate}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Tipe Motor:</span> <strong className="text-white">{ticketData.motor_model}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Kategori:</span> <strong className="text-amber-400">{ticketData.category}</strong></div>

                {ticketData.is_attended && (
                  <div className="mt-4 pt-3 border-t border-slate-800 bg-emerald-950/30 p-3 rounded-lg text-center">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                      <CheckCircle2 size={12} /> Terverifikasi Masuk Lokasi
                    </p>
                    <p className="text-2xl font-black text-amber-400 mt-1">No. Doorprize: #{ticketData.lucky_number}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TicketCheckPage() {
  return (
    <Suspense fallback={<p className="text-white text-center p-10">Loading...</p>}>
      <TicketContent />
    </Suspense>
  );
}
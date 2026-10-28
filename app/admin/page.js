'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { sendWhatsAppMessage } from '../../lib/utils';
import { Html5QrcodeScanner } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { CheckCircle2, XCircle, QrCode, Users, Send, Search, ArrowLeft, ShieldCheck, Trophy, LogOut, Lock } from 'lucide-react';

const ADMIN_EMAIL = "bubaranmothaii@gmail.com";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('verification');
  const [registrations, setRegistrations] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [processingScan, setProcessingScan] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      if (loggedInUser.email !== ADMIN_EMAIL) {
        await signOut(auth);
        alert('Akses Ditolak! Akun Google tersebut tidak memiliki izin panitia.');
      }
    } catch (error) {
      alert('Gagal login: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const q = collection(db, 'registrations');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      data.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
      setRegistrations(data);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (activeTab !== 'scanner' || !user || user.email !== ADMIN_EMAIL) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 220, height: 220 } },
      false
    );

    scanner.render(handleScanSuccess, handleScanFailure);

    return () => {
      scanner.clear().catch((err) => console.error('Failed to clear scanner', err));
    };
  }, [activeTab, processingScan, user]);

  const handleUpdateStatus = async (docId, newStatus) => {
    try {
      const docRef = doc(db, 'registrations', docId);
      await updateDoc(docRef, { status: newStatus });
    } catch (error) {
      alert('Gagal memperbarui status: ' + error.message);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    if (processingScan) return;
    setProcessingScan(true);
    setScanResult(null);
    setScanError(null);

    try {
      const q = query(collection(db, 'registrations'), where('ticket_code', '==', decodedText.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setScanError('❌ QR Code Tidak Ditemukan / Tidak Valid!');
        setProcessingScan(false);
        return;
      }

      const participantDoc = snapshot.docs[0];
      const participant = participantDoc.data();

      if (participant.status !== 'APPROVED') {
        setScanError(`⚠️ Peserta atas nama ${participant.full_name} belum di-ACC oleh panitia!`);
        setProcessingScan(false);
        return;
      }

      if (participant.is_attended) {
        setScanError(`⚠️ PERINGATAN: ${participant.full_name} sudah Check-in! (No. Doorprize: #${participant.lucky_number})`);
        setProcessingScan(false);
        return;
      }

      const qAttended = query(collection(db, 'registrations'), where('is_attended', '==', true));
      const attendedSnapshot = await getDocs(qAttended);
      const nextNumber = attendedSnapshot.size + 1;
      const formattedLuckyNumber = String(nextNumber).padStart(3, '0');

      const docRef = doc(db, 'registrations', participantDoc.id);
      await updateDoc(docRef, {
        is_attended: true,
        lucky_number: formattedLuckyNumber,
        attended_at: serverTimestamp(),
      });

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

      setScanResult({
        name: participant.full_name,
        plate: participant.license_plate,
        motor: participant.motor_model,
        category: participant.category,
        luckyNumber: formattedLuckyNumber,
      });

    } catch (err) {
      setScanError('Gagal memproses QR Code: ' + err.message);
    } finally {
      setTimeout(() => setProcessingScan(false), 2000);
    }
  };

  const handleScanFailure = (error) => {};

  const filteredRegistrations = registrations.filter((item) =>
    item.full_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.license_plate?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.ticket_code?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-sm">
        Memeriksa otentikasi panitia...
      </div>
    );
  }

  // TAMPILAN LOGIN (EMAIL DISEMBUNYIKAN)
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl relative">
          <Link href="/" className="absolute left-6 top-6 text-slate-400 hover:text-white transition">
            <ArrowLeft size={18} />
          </Link>
          
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mt-2">
            <Lock size={28} />
          </div>

          <div>
            <h1 className="text-xl font-black text-white">RESTRICTED AREA</h1>
            <p className="text-xs text-slate-400 mt-1">Halaman Dashboard Khusus Panitia BubaranMothai 2027</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400">
            Akses halaman ini diproteksi secara eksklusif menggunakan akun Google resmi panitia.
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-950 font-extrabold rounded-xl text-xs transition flex items-center justify-center gap-3 shadow-lg cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Login dengan Google Panitia
          </button>
        </div>
      </div>
    );
  }

  // DASHBOARD UTAMA
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="text-amber-400" size={22} /> Dashboard Panitia
              </h1>
              <p className="text-xs text-slate-400 mt-1">BubaranMothai 2027 Management Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('verification')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeTab === 'verification'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Users size={16} /> Verifikasi ({registrations.length})
              </button>
              <button
                onClick={() => setActiveTab('scanner')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  activeTab === 'scanner'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <QrCode size={16} /> Live Scanner (Hari-H)
              </button>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar / Logout"
              className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* TAB 1: VERIFIKASI */}
        {activeTab === 'verification' && (
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Cari Nama / Plat / Kode..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:border-amber-500 transition"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Peserta</th>
                    <th className="p-4">Kendaraan</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Kode Tiket</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        Belum ada data pendaftaran yang masuk.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4">
                          <p className="font-bold text-white text-sm">{item.full_name}</p>
                          <p className="text-slate-400 mt-0.5">{item.phone_number}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-mono font-bold text-amber-400">{item.license_plate}</p>
                          <p className="text-slate-400 mt-0.5">{item.motor_model}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border ${
                            item.category === 'VIP' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-300 font-semibold">{item.ticket_code}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                            item.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                            item.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {item.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                                >
                                  <CheckCircle2 size={14} /> ACC
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
                                >
                                  <XCircle size={14} /> Tolak
                                </button>
                              </>
                            )}

                            {item.status === 'APPROVED' && (
                              <button
                                onClick={() => sendWhatsAppMessage(
                                  item.phone_number,
                                  item.full_name,
                                  item.license_plate,
                                  item.motor_model,
                                  item.category,
                                  item.ticket_code
                                )}
                                className="px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white text-emerald-400 font-bold rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Send size={14} /> Kirim WA
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE SCANNER */}
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center">
              <h2 className="text-base font-bold text-amber-400 mb-4 flex items-center gap-2">
                <QrCode size={20} /> Arahkan Kamera ke QR Code Peserta
              </h2>
              <div id="qr-reader" className="w-full max-w-sm rounded-xl overflow-hidden bg-slate-950 border border-slate-800"></div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-center">
              {!scanResult && !scanError && (
                <div className="text-center text-slate-500 py-12 space-y-2">
                  <QrCode size={56} className="mx-auto opacity-30" />
                  <p className="text-sm">Menunggu pemindaian QR Code peserta...</p>
                </div>
              )}

              {scanError && (
                <div className="bg-red-950/60 border border-red-500/50 p-6 rounded-2xl text-center space-y-2">
                  <XCircle size={48} className="text-red-500 mx-auto" />
                  <h3 className="text-lg font-bold text-red-400">PEMINDAIAN GAGAL</h3>
                  <p className="text-xs text-red-200">{scanError}</p>
                </div>
              )}

              {scanResult && (
                <div className="bg-emerald-950/50 border border-emerald-500/50 p-6 rounded-2xl text-center space-y-4">
                  <CheckCircle2 size={56} className="text-emerald-400 mx-auto" />
                  <div>
                    <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase">
                      Kategori: {scanResult.category}
                    </span>
                    <h3 className="text-2xl font-black text-white mt-2">{scanResult.name}</h3>
                    <p className="text-emerald-300 font-mono text-sm">{scanResult.plate} — {scanResult.motor}</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                      <Trophy size={14} className="text-amber-400" /> Nomor Undian Doorprize
                    </p>
                    <p className="text-4xl font-black text-amber-400 mt-1">#{scanResult.luckyNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
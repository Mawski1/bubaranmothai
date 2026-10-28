'use client';

import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateTicketCode, formatPhoneNumber } from '../../lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, User, Phone, Car, Bike, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    licensePlate: '',
    motorModel: '',
    category: 'DISPLAY',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const ticketCode = generateTicketCode();
    const formattedPhone = formatPhoneNumber(formData.phoneNumber);

    try {
      await addDoc(collection(db, 'registrations'), {
        full_name: formData.fullName,
        phone_number: formattedPhone,
        license_plate: formData.licensePlate.toUpperCase(),
        motor_model: formData.motorModel,
        category: formData.category,
        ticket_code: ticketCode,
        status: 'PENDING',
        is_attended: false,
        lucky_number: null,
        attended_at: null,
        created_at: serverTimestamp(),
      });

      router.push(`/ticket-check?q=${ticketCode}`);
    } catch (error) {
      alert('Gagal mendaftar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition mb-6"
        >
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Pendaftaran BubaranMothai <Sparkles size={20} className="text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">Lengkapi data kendaraan untuk berpartisipasi di event BubaranMothai 2027.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Nama Lengkap Pemilik</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-slate-500" size={18} />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                placeholder="Contoh: Budi Santoso"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Nomor WhatsApp Active</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 text-slate-500" size={18} />
              <input
                type="tel"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                placeholder="Contoh: 081234567890"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Plat Nomor</label>
              <div className="relative">
                <Car className="absolute left-3.5 top-3 text-slate-500" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-amber-400 font-bold uppercase focus:outline-none focus:border-amber-500 transition"
                  placeholder="B 1234 ABC"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Tipe / Type Motor</label>
              <div className="relative">
                <Bike className="absolute left-3.5 top-3 text-slate-500" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                  placeholder="Honda Beat / Mio"
                  value={formData.motorModel}
                  onChange={(e) => setFormData({ ...formData, motorModel: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Kategori Pendaftaran</label>
            <select
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="DISPLAY">DISPLAY (Kontes / Pajangan)</option>
              <option value="VIP">VIP (Parkir Khusus VIP)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              'Memproses Data...'
            ) : (
              <>
                <Send size={18} /> Kirim Pendaftaran Sekarang
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
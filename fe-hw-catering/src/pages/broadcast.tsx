import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { broadcastApi } from '@/lib/api/broadcast';

function BroadcastContent() {
    const { token } = useAuth();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !message.trim()) return;

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await broadcastApi.send(token, message);

            setSuccess('Broadcast berhasil dikirim ke antrian');
            setMessage('');
            setTimeout(() => setSuccess(''), 5000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Kirim Broadcast WhatsApp</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Pesan akan dikirim ke semua pelanggan yang terdaftar.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Pesan Broadcast
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="Tulis pesan broadcast disini..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            * Pesan akan dikirim as-is. Gunakan *text* untuk bold, _text_ untuk italic.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Kirim Broadcast
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}

export default function BroadcastPage() {
    return (
        <ProtectedRoute requireAdmin>
            <BroadcastContent />
        </ProtectedRoute>
    );
}

import { useAuth } from '@/contexts/AuthContext';
import { Menu, menuApi } from '@/lib/api/menu';
import { motion } from 'framer-motion';
import { ArrowRight, ChefHat, MapPin, Phone, ShoppingBag } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Mock data for fallback
const MOCK_RECIPES = [
    {
        id: 1,
        nama: "Nasi Goreng Spesial",
        deskripsi: "Nasi goreng dengan bumbu rahasia dan topping lengkap.",
        harga: 25000,
        foto: "/images/nasi-goreng.jpg", // Placeholder
        kategori: "Main Course",
        rating: 4.8
    },
    {
        id: 2,
        nama: "Ayam Bakar Madu",
        deskripsi: "Ayam bakar lembut dengan olesan madu murni.",
        harga: 30000,
        foto: "/images/ayam-bakar.jpg", // Placeholder
        kategori: "Main Course",
        rating: 4.9
    },
    {
        id: 3,
        nama: "Salad Buah Segar",
        deskripsi: "Campuran buah-buahan segar dengan dressing yogurt.",
        harga: 20000,
        foto: "/images/salad.jpg", // Placeholder
        kategori: "Dessert",
        rating: 4.7
    }
];

export default function LandingPage() {
    const { user } = useAuth();
    const [featuredMenus, setFeaturedMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                // Try to fetch public menus (assuming the API might allow it or we use a guest token if available)
                // Since we don't have a public endpoint confirmed, we'll try with an empty token or skip strict auth check if backend allows
                // For now, we simulate API integration. In a real app, we'd have a public endpoint.
                const token = localStorage.getItem('token') || '';
                const response = await menuApi.getAll(token, { per_page: 3 });
                if (response.success) {
                    setFeaturedMenus(response.data.data);
                } else {
                    // Fallback if API fails (e.g. 401 Unauthorized)
                    console.log("Using mock data due to API auth requirement or error");
                    setFeaturedMenus(MOCK_RECIPES as any);
                }
            } catch (error) {
                console.error("Failed to fetch menus:", error);
                setFeaturedMenus(MOCK_RECIPES as any);
            } finally {
                setLoading(false);
            }
        };

        fetchMenus();
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            <Head>
                <title>HW Catering - Rasakan yang Terbaik</title>
                <meta name="description" content="Layanan katering terbaik di kota" />
            </Head>

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-2xl font-bold text-yellow-500"
                        >
                            <img src="/logo.png" alt="HW Catering Logo" className="h-15 w-auto" />
                        </motion.div>
                        <div className="hidden md:flex space-x-8">
                            <Link href="/" className="text-gray-600 hover:text-yellow-500 transition-colors">Beranda</Link>
                            <Link href="#recipes" className="text-gray-600 hover:text-yellow-500 transition-colors">Menu</Link>
                            <Link href="#contact" className="text-gray-600 hover:text-yellow-500 transition-colors">Kontak</Link>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            {user ? (
                                <Link href="/dashboard" className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg shadow-yellow-200">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href="/login" className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg shadow-yellow-200">
                                    Masuk
                                </Link>
                            )}
                        </motion.div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-linear-to-br from-teal-500 to-teal-600">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    {/* Abstract Background patterns could go here */}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-white space-y-6"
                        >
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="inline-block px-4 py-1.5 rounded-full bg-yellow-400 text-yellow-900 font-semibold text-sm mb-2"
                            >
                                #1 Pilihan Katering Terbaik
                            </motion.span>
                            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                                Sajian Istimewa <br />
                                <span className="text-yellow-300">Khusus Untuk Anda</span>
                            </h1>
                            <p className="text-teal-100 text-lg md:text-xl max-w-lg">
                                Temukan rasa otentik dan resep sehat yang dibuat dengan penuh semangat.
                                Pas untuk makan sehari-hari atau acara spesial.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link href="#recipes">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-yellow-400 text-yellow-900 px-8 py-3 rounded-full font-bold shadow-lg shadow-yellow-500/30 flex items-center gap-2"
                                    >
                                        Jelajahi Menu <ArrowRight size={20} />
                                    </motion.button>
                                </Link>
                                <Link href="https://wa.me/6285701375559?text=Halo%2C%20saya%20tertarik%20dengan%20menu%20yang%20harganya%20Rp%20100000">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-all"
                                    >
                                        Pesan Sekarang
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Hero Image
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="relative"
                        >
                            <div className="relative w-full aspect-square max-w-md mx-auto">
                                
                                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                                <Image
                                    src="/hero-image.png"
                                    alt="Delicious Food"
                                    fill
                                    className="object-contain drop-shadow-2xl z-10"
                                    priority
                                />

                                
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl z-20 flex items-center gap-3"
                                >
                                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                                        <Star fill="currentColor" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Rating 4.9</p>
                                        <p className="text-xs text-gray-500">Dari 1rb+ Ulasan</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div> */}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50 from-gray-50 to-white" id="recipes">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-yellow-500 font-bold uppercase tracking-wider">Menu Kami</span>
                        <h2 className="text-4xl font-bold text-gray-900">Resep Terbaik Kami</h2>
                        <div className="w-20 h-1.5 bg-yellow-400 mx-auto rounded-full"></div>
                    </div>

                    {/* Menu List */}
                    <div className="mt-20">
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                            <span className="w-2 h-8 bg-yellow-400 rounded-full"></span>
                            Menu Populer
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse h-64"></div>
                                ))
                            ) : (
                                featuredMenus.map((menu: any, index: number) => (
                                    <motion.div
                                        key={menu.id || index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                                    >
                                        <div className="h-48 w-full bg-gray-100 rounded-2xl mb-4 relative overflow-hidden group">
                                            {/* In real app, use menu.foto if available */}
                                            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                                                {menu.foto ? (
                                                    <Image src={process.env.NEXT_PUBLIC_STORAGE_URL + menu.foto} alt={menu.nama} fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                                ) : (
                                                    <ChefHat size={48} className="opacity-20" />
                                                )}
                                            </div>
                                            <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                                {menu.kategori}
                                            </div>
                                        </div>
                                        <div className="px-2 pb-2">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-xl text-gray-800 line-clamp-1">{menu.nama}</h4>
                                                <span className="font-bold text-yellow-600">
                                                    Rp {menu.harga?.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                                {menu.deskripsi || "Menu spesial yang lezat dan bergizi."}
                                            </p>
                                            <Link href={`https://wa.me/6285701375559?text=Halo%2C%20saya%20tertarik%20dengan%20menu%20${menu.nama}%20yang%20harganya%20Rp%20${menu.harga}`}>
                                                <button className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-yellow-400 hover:text-yellow-900 transition-colors flex items-center justify-center gap-2">
                                                    <ShoppingBag size={18} /> Pesan Sekarang
                                                </button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 bg-white" id="contact">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-yellow-500 font-bold uppercase tracking-wider">Hubungi Kami</span>
                        <h2 className="text-4xl font-bold text-gray-900">Tetap Terhubung</h2>
                        <div className="w-20 h-1.5 bg-yellow-400 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* WhatsApp */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gray-50 p-8 rounded-3xl text-center group hover:bg-yellow-400 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500 group-hover:text-yellow-900 shadow-md">
                                <Phone size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-white">WhatsApp</h3>
                            <p className="text-gray-500 mb-6 group-hover:text-yellow-100">Hubungi kami via WhatsApp untuk respon cepat.</p>
                            <a
                                href="https://wa.me/6285701375559?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20catering"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-6 py-2 rounded-full border-2 border-yellow-500 text-yellow-600 font-bold group-hover:bg-white group-hover:border-white group-hover:text-yellow-900 transition-colors"
                            >
                                Chat Sekarang
                            </a>
                        </motion.div>

                        {/* Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-50 p-8 rounded-3xl text-center group hover:bg-yellow-400 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500 group-hover:text-yellow-900 shadow-md">
                                <MapPin size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-white">Lokasi</h3>
                            <p className="text-gray-500 mb-6 group-hover:text-yellow-100">Kunjungi dapur kami (dengan janji temu).</p>
                            <a
                                href="https://maps.app.goo.gl/K1ffNZd7bhQGubjR9"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-4 py-2 rounded-full bg-white/50 text-gray-600 font-medium text-sm group-hover:bg-white/20 group-hover:text-white">
                                Perumahan kaligawe Blok D no.26 Pakumbulan buaran Kab.pekalongan Jawa tengah
                            </a>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer / CTA */}
            <footer className="bg-gray-900 text-white pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
                        <p>&copy; 2026 HW Catering. Hak cipta dilindungi.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-yellow-400 transition-colors">Kebijakan Privasi</a>
                            <a href="#" className="hover:text-yellow-400 transition-colors">Syarat Ketentuan</a>
                            <a href="#" className="hover:text-yellow-400 transition-colors">Kontak</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

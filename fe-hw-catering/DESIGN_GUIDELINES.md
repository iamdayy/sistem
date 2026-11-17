# Design Guidelines - Aplikasi Katering

## 1. Typography
- **Font Family**: Inter (dari Next.js Google Fonts)
- Sudah diterapkan di `_app.tsx`

## 2. Color Scheme
- **Primary Color**: Yellow (`yellow-500`, `yellow-600`)
- **Text**:
  - Primary: `gray-900`
  - Secondary: `gray-700`
  - Muted: `gray-500`
- **Background**:
  - Main: `gray-50`
  - Card: `white`
  - Border: `gray-200`

## 3. Modal/Dialog Design
**PENTING**: Semua modal/dialog TIDAK menggunakan background overlay gelap atau blur.

### Standar Modal:
```tsx
// GUNAKAN komponen Modal yang sudah dibuat
import Modal from '@/components/Modal';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Judul Modal"
  subtitle="Optional subtitle" // opsional
  maxWidth="md" // sm | md | lg | xl
>
  {/* Konten modal */}
</Modal>
```

### Karakteristik:
- ✅ **TANPA** background overlay (`bg-black bg-opacity-50` ❌)
- ✅ **TANPA** backdrop blur (`backdrop-blur-sm` ❌)
- ✅ Background transparan, halaman di belakang terlihat penuh
- ✅ Modal putih dengan shadow dan border
- ✅ Tombol close (X) di pojok kanan atas

### Contoh BENAR:
```tsx
<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-xl w-full max-w-md shadow-xl border border-gray-200">
    {/* Modal content */}
  </div>
</div>
```

### Contoh SALAH:
```tsx
// ❌ JANGAN seperti ini
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
```

## 4. Buttons
### Primary Button (Yellow):
```tsx
className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
```

### Secondary Button (Gray):
```tsx
className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
```

### Danger Button (Red):
```tsx
className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
```

## 5. Form Inputs
```tsx
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
```

## 6. Tables
- Background header: `bg-gray-50`
- Border: `border-gray-200`
- Hover row: `hover:bg-gray-50`
- Divide rows: `divide-y divide-gray-200`

## 7. Cards/Containers
```tsx
className="bg-white rounded-lg border border-gray-200 p-4"
```

## 8. Layout
- Main background: `bg-gray-50`
- Sidebar: `bg-white border-r border-gray-200`
- Header: `bg-white border-b border-gray-200 sticky top-0`
- Main content padding: `p-8`

## 9. Icons
- Gunakan SVG inline dengan Heroicons style
- Stroke width: `1.5` atau `2`
- Size: `w-4 h-4` (small), `w-5 h-5` (normal), `w-6 h-6` (large)

## 10. Spacing
- Section spacing: `space-y-6`
- Form spacing: `space-y-4`
- Button gap: `gap-2` atau `gap-3`

## 11. Border Radius
- Buttons/Inputs: `rounded-lg`
- Cards: `rounded-lg`
- Modals: `rounded-xl`
- Avatars: `rounded-full`

## 12. Alerts/Messages
### Success:
```tsx
className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
```

### Error:
```tsx
className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
```

### Warning:
```tsx
className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg"
```

---

**Catatan**: Selalu gunakan komponen yang sudah dibuat (`Modal`, `Layout`, `ProtectedRoute`, dll) untuk konsistensi desain.

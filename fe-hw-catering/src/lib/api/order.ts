const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type OrderStatus = 'pending' | 'dikonfirmasi' | 'diproses' | 'dikirim' | 'selesai' | 'dibatalkan';
export type PaymentStatus = 'belum_bayar' | 'dp' | 'lunas';

export interface OrderItem {
  id?: number;
  menu_id: number;
  jumlah: number;
  harga?: number;
  subtotal?: number;
  catatan?: string;
  menu?: {
    id: number;
    nama: string;
    harga: number;
  };
}

export interface OrderDetail {
  id: number;
  order_id: number;
  menu_id: number;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  catatan?: string;
  menu: {
    id: number;
    nama: string;
    deskripsi: string;
    harga: number;
    kategori: string;
    foto?: string;
    tersedia: boolean;
  };
}

export interface rincianBelanja {
  nama: string;
  jumlah: number;
  satuan: string;
  harga: number;
  subtotal: number;
}

export interface Order {
  id: number;
  invoice_token?: string;
  nomor_order: string;
  pelanggan_id: number;
  tanggal_order: string;
  tanggal_acara: string;
  waktu_acara: string;
  alamat_pengiriman: string;
  jumlah_tamu: number;
  status: OrderStatus;
  total_harga: number;
  catatan?: string;
  // Payment fields from backend
  payment_type?: string; // 'cash', 'dp', 'lunas'
  dp_amount?: number | string;
  dp_paid?: boolean;
  dp_paid_at?: string;
  paid_full?: boolean;
  paid_full_at?: string;
  remaining_amount?: number | string;
  payment_due_date?: string;
  // Legacy fields for compatibility
  payment_status?: PaymentStatus;
  remaining_payment?: number;
  total_paid?: number;
  fully_paid_at?: string;
  pelanggan?: {
    id: number;
    nama: string;
    email: string;
    telepon: string;
    alamat?: string;
  };
  items: OrderItem[];
  order_detail?: OrderDetail[];
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: Order[];
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

export interface OrderFormData {
  pelanggan_id: number;
  tanggal_order: string;
  tanggal_acara: string;
  waktu_acara: string;
  alamat_pengiriman: string;
  jumlah_tamu: number;
  catatan?: string;
  items: {
    menu_id: number;
    jumlah: number;
    catatan?: string;
  }[];
}

export interface OrderUpdateData {
  pelanggan_id: number;
  tanggal_order: string;
  tanggal_acara: string;
  waktu_acara: string;
  alamat_pengiriman: string;
  jumlah_tamu: number;
  catatan?: string;
  items: {
    menu_id: number;
    jumlah: number;
    catatan?: string;
  }[];
}

export interface LaporanResponse {
  success: boolean;
  message: string;
  data: {
    periode: {
      tanggal_mulai: string;
      tanggal_akhir: string;
    };
    ringkasan: {
      total_order: number;
      total_pendapatan: number;
      status: {
        pending: number;
        dikonfirmasi: number;
        diproses: number;
        dikirim: number;
        selesai: number;
        dibatalkan: number;
      };
    };
    menu_terlaris: {
      menu_id: number;
      total_terjual: number;
      menu: {
        id: number;
        nama: string;
        harga: number;
      };
    }[];
    orders: Order[];
  };
}

export interface RincianBelanjaResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      nomor_order: string;
      total_harga: number;
    },
    rincian_belanja: rincianBelanja[];
    total_belanja: number;
  };
}

export const orderApi = {
  getAll: async (token: string, params?: {
    search?: string;
    status?: OrderStatus;
    tanggal_mulai?: string;
    tanggal_akhir?: string;
    per_page?: number;
    page?: number;
  }): Promise<OrderResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.tanggal_mulai) queryParams.append('tanggal_mulai', params.tanggal_mulai);
    if (params?.tanggal_akhir) queryParams.append('tanggal_akhir', params.tanggal_akhir);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const response = await fetch(`${API_URL}/orders?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data order');
    }

    return response.json();
  },

  getById: async (token: string, id: number): Promise<{ success: boolean; message: string; data: Order }> => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data order');
    }

    return response.json();
  },

  create: async (token: string, data: OrderFormData): Promise<{ success: boolean; message: string; data: Order }> => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menambah order');
    }

    return response.json();
  },

  update: async (token: string, id: number, data: OrderUpdateData): Promise<{ success: boolean; message: string; data: Order }> => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengupdate order');
    }

    return response.json();
  },

  delete: async (token: string, id: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal menghapus order');
    }

    return response.json();
  },

  updateStatus: async (token: string, id: number, status: OrderStatus): Promise<{ success: boolean; message: string; data: Order }> => {
    const response = await fetch(`${API_URL}/orders/${id}/update-status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengupdate status');
    }

    return response.json();
  },

  getLaporan: async (token: string, params: {
    tanggal_mulai: string;
    tanggal_akhir: string;
  }): Promise<LaporanResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('tanggal_mulai', params.tanggal_mulai);
    queryParams.append('tanggal_akhir', params.tanggal_akhir);

    const response = await fetch(`${API_URL}/orders/laporan?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil laporan');
    }

    return response.json();
  },

  downloadInvoice: async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/orders/${id}/invoice/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mendownload invoice');
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `Invoice_${id}.pdf`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  previewInvoice: (id: number): string => {
    return `${API_URL}/orders/${id}/invoice/preview`;
  },

  previewInvoicePublic: (token: string): string => {
    return `${API_URL}/invoice/${token}`;
  },

  // Payment endpoints
  payDP: async (token: string, id: number, dp_amount: number): Promise<{ success: boolean; message: string; data: Order }> => {
    const response = await fetch(`${API_URL}/orders/${id}/pay-dp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dp_amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal membayar DP');
    }

    return response.json();
  },

  payFull: async (token: string, id: number): Promise<{ success: boolean; message: string; data: Order }> => {
    const response = await fetch(`${API_URL}/orders/${id}/pay-full`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal melunasi pembayaran');
    }

    return response.json();
  },

  getPaymentHistory: async (token: string, id: number): Promise<{
    success: boolean;
    message: string;
    data: {
      order: {
        nomor_order: string;
        total_harga: number;
        payment_status: PaymentStatus;
        total_paid: number;
        remaining_payment: number;
      };
      history: Array<{
        type: string;
        amount: number;
        paid_at: string;
      }>;
    };
  }> => {
    const response = await fetch(`${API_URL}/orders/${id}/payment-history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil riwayat pembayaran');
    }

    return response.json();
  },

  getRincianBelanja: async (token: string, id: number): Promise<RincianBelanjaResponse> => {
    const response = await fetch(`${API_URL}/orders/${id}/rincian-belanja`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil rincian belanja');
    }

    return response.json();
  },

  downloadRincianBelanja: async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/orders/${id}/rincian-belanja/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mendownload rincian belanja');
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `Rincian_Belanja_${id}.pdf`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

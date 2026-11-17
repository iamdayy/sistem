const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface DashboardData {
  periode: {
    start_date: string;
    end_date: string;
  };
  total_data: {
    bahan: number;
    resep: number;
    menu: number;
    pelanggan: number;
  };
  order_statistics: {
    total_orders: number;
    total_revenue: number;
    by_status: {
      pending: number;
      dikonfirmasi: number;
      diproses: number;
      dikirim: number;
      selesai: number;
      dibatalkan: number;
    };
  };
  bahan_stok_rendah: {
    id: number;
    nama: string;
    satuan: string;
  }[];
  menu_terlaris: {
    menu_id: number;
    total_terjual: number;
    total_pendapatan: number;
    menu: {
      id: number;
      nama: string;
      harga: number;
      kategori: string;
    };
  }[];
  revenue_per_day: {
    tanggal: string;
    total_order: number;
    total_pendapatan: number;
  }[];
  recent_orders: any[];
  customer_statistics: {
    pelanggan_baru: number;
    top_pelanggan: {
      id: number;
      nama: string;
      orders_count: number;
      orders_sum_total_harga: number;
    }[];
  };
  kategori_terlaris: {
    kategori: string;
    total_terjual: number;
  }[];
}

export interface DashboardSummary {
  today: {
    orders: number;
    revenue: number;
  };
  this_month: {
    orders: number;
    revenue: number;
  };
  alerts: {
    pending_orders: number;
    low_stock_items: number;
  };
}

export interface DashboardCharts {
  daily_revenue: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  orders_by_status: {
    status: string;
    total: number;
  }[];
  top_menus: {
    menu_id: number;
    total: number;
    menu: {
      id: number;
      nama: string;
      kategori: string;
    };
  }[];
}

export const dashboardApi = {
  getData: async (token: string, params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ success: boolean; message: string; data: DashboardData }> => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const response = await fetch(`${API_URL}/dashboard?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data dashboard');
    }

    return response.json();
  },

  getSummary: async (token: string): Promise<{ success: boolean; message: string; data: DashboardSummary }> => {
    const response = await fetch(`${API_URL}/dashboard/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil ringkasan dashboard');
    }

    return response.json();
  },

  getCharts: async (token: string, params?: {
    days?: number;
  }): Promise<{ success: boolean; message: string; data: DashboardCharts }> => {
    const queryParams = new URLSearchParams();
    if (params?.days) queryParams.append('days', params.days.toString());

    const response = await fetch(`${API_URL}/dashboard/charts?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Gagal mengambil data chart');
    }

    return response.json();
  },
};

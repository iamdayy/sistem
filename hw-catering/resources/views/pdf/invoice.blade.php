<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $order->nomor_order }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
        }

        .container {
            padding: 15px;
            max-width: 800px;
            margin: 0 auto;
        }

        .header {
            margin-bottom: 15px;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 12px;
        }

        .header-top {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }

        .company-info {
            display: table-cell;
            width: 60%;
            vertical-align: top;
        }

        .company-logo {
            margin-bottom: 8px;
            width: 120px;
            height: auto;
        }

        .company-logo img {
            width: 100%;
            height: auto;
            object-fit: contain;
        }

        .company-details {
            margin-top: 5px;
        }

        .invoice-info {
            display: table-cell;
            width: 40%;
            text-align: right;
            vertical-align: top;
        }

        .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 3px;
        }

        .company-tagline {
            font-size: 10px;
            color: #7f8c8d;
            margin-bottom: 5px;
        }

        .company-contact {
            font-size: 9px;
            color: #555;
            line-height: 1.3;
        }

        .invoice-title {
            font-size: 22px;
            font-weight: bold;
            color: #e74c3c;
            margin-bottom: 3px;
        }

        .invoice-number {
            font-size: 12px;
            color: #555;
        }

        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 12px;
        }

        .info-left,
        .info-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .info-box {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 3px;
            margin-right: 8px;
        }

        .info-right .info-box {
            margin-right: 0;
            margin-left: 8px;
        }

        .info-title {
            font-size: 10px;
            text-transform: uppercase;
            color: #7f8c8d;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .info-content {
            font-size: 10px;
            line-height: 1.5;
        }

        .info-content strong {
            display: inline-block;
            width: 90px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        table thead {
            background-color: #2c3e50;
            color: white;
        }

        table thead th {
            padding: 8px 6px;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            font-weight: bold;
        }

        table tbody td {
            padding: 6px 6px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 10px;
        }

        table tbody tr:last-child td {
            border-bottom: 2px solid #2c3e50;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .summary {
            margin-top: 5px;
            float: right;
            width: 280px;
        }

        .summary-row {
            display: table;
            width: 100%;
            margin-bottom: 5px;
        }

        .summary-label {
            display: table-cell;
            text-align: right;
            padding-right: 12px;
            font-size: 11px;
        }

        .summary-value {
            display: table-cell;
            text-align: right;
            font-size: 11px;
        }

        .summary-total {
            border-top: 2px solid #2c3e50;
            padding-top: 8px;
            margin-top: 8px;
            font-weight: bold;
        }

        .summary-total .summary-label,
        .summary-total .summary-value {
            font-size: 14px;
            color: #e74c3c;
        }

        .notes {
            clear: both;
            margin-top: 15px;
            padding: 10px;
            background: #fff9e6;
            border-left: 3px solid #f39c12;
            border-radius: 3px;
        }

        .notes-title {
            font-weight: bold;
            margin-bottom: 3px;
            color: #f39c12;
            font-size: 10px;
        }

        .footer {
            margin-top: 20px;
            padding-top: 12px;
            /* border-top: 1px solid #e0e0e0; */
            text-align: center;
            font-size: 9px;
            color: #7f8c8d;
            line-height: 1.4;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-pending {
            background: #fff3cd;
            color: #856404;
        }

        .status-dikonfirmasi {
            background: #d1ecf1;
            color: #0c5460;
        }

        .status-diproses {
            background: #d1d1f1;
            color: #383d41;
        }

        .status-dikirim {
            background: #cce5ff;
            color: #004085;
        }

        .status-selesai {
            background: #d4edda;
            color: #155724;
        }

        .status-dibatalkan {
            background: #f8d7da;
            color: #721c24;
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-top">
                <div class="company-info">
                    <div class="company-logo">
                        <img src="{{ public_path('logo.png') }}" alt="HW Katering Logo">
                    </div>
                    <div class="company-details">
                        <div class="company-contact">
                            <strong>Alamat Kantor:</strong><br>
                            Perumahan Kaligawe Blok D No.26<br>
                            Pakumbulan Buaran, Kab. Pekalongan
                        </div>
                    </div>
                </div>
                <div class="invoice-info">
                    <div class="invoice-title">INVOICE</div>
                    <div class="invoice-number">#{{ $order->nomor_order }}</div>
                    <div style="margin-top: 5px;">
                        <span class="status-badge status-{{ $order->status }}">{{ strtoupper($order->status) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Info Pelanggan & Order -->
        <div class="info-section">
            <div class="info-left">
                <div class="info-box">
                    <div class="info-title">Informasi Pelanggan</div>
                    <div class="info-content">
                        <strong>Nama:</strong> {{ $order->pelanggan->nama }}<br>
                        <strong>Email:</strong> {{ $order->pelanggan->email }}<br>
                        <strong>Telepon:</strong> {{ $order->pelanggan->telepon }}<br>
                        <strong>Alamat:</strong> {{ $order->pelanggan->alamat }}
                    </div>
                </div>
            </div>
            <div class="info-right">
                <div class="info-box">
                    <div class="info-title">Detail Acara</div>
                    <div class="info-content">
                        <strong>Tanggal Order:</strong> {{ \Carbon\Carbon::parse($order->tanggal_order)->format('d M Y') }}<br>
                        <strong>Tanggal Acara:</strong> {{ \Carbon\Carbon::parse($order->tanggal_acara)->format('d M Y') }}<br>
                        <strong>Waktu:</strong> {{ $order->waktu_acara ?? '-' }}<br>
                        <strong>Jumlah Tamu:</strong> {{ $order->jumlah_tamu }} orang
                    </div>
                </div>
            </div>
        </div>

        <!-- Lokasi Acara -->
        <div style="margin-bottom: 12px;">
            <div class="info-box">
                <div class="info-title">Lokasi Pengiriman</div>
                <div class="info-content">
                    {{ $order->alamat_pengiriman }}
                </div>
            </div>
        </div>

        <!-- Detail Order -->
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 45%;">Nama Menu</th>
                    <th style="width: 15%;" class="text-center">Jumlah</th>
                    <th style="width: 17%;" class="text-right">Harga Satuan</th>
                    <th style="width: 18%;" class="text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->orderDetail as $index => $detail)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $detail->menu->nama }}</strong>
                        @if($detail->catatan)
                        <br><small style="color: #7f8c8d; font-size: 10px;">Catatan: {{ $detail->catatan }}</small>
                        @endif
                    </td>
                    <td class="text-center">{{ $detail->jumlah }}</td>
                    <td class="text-right">Rp {{ number_format($detail->harga_satuan, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($detail->subtotal, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Summary -->
        <div class="summary">
            <div class="summary-row">
                <div class="summary-label">Subtotal:</div>
                <div class="summary-value">Rp {{ number_format($order->total_harga, 0, ',', '.') }}</div>
            </div>
            <div class="summary-row summary-total">
                <div class="summary-label">TOTAL:</div>
                <div class="summary-value">Rp {{ number_format($order->total_harga, 0, ',', '.') }}</div>
            </div>

            <!-- Status Pembayaran -->
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
                <div class="summary-row">
                    <div class="summary-label" style="color: #2c3e50; font-weight: bold;">Status Pembayaran:</div>
                    <div class="summary-value" style="font-weight: bold; color: {{ $order->payment_type == 'cash' ? '#155724' : ($order->payment_type == 'dp' ? '#856404' : '#721c24') }};">
                        @if($order->payment_type == 'cash')
                            LUNAS
                        @elseif($order->payment_type == 'dp')
                            DP
                        @else
                            BELUM BAYAR
                        @endif
                    </div>
                </div>

                @if($order->payment_type == 'dp')
                <div class="summary-row" style="font-size: 10px;">
                    <div class="summary-label">DP Dibayar:</div>
                    <div class="summary-value">Rp {{ number_format($order->dp_amount, 0, ',', '.') }}</div>
                </div>
                <div class="summary-row" style="font-size: 10px;">
                    <div class="summary-label">Sisa Pembayaran:</div>
                    <div class="summary-value" style="color: #e74c3c;">Rp {{ number_format($order->remaining_amount, 0, ',', '.') }}</div>
                </div>
                @endif
            </div>
        </div>

        <!-- Notes -->
        @if($order->catatan)
        <div class="notes">
            <div class="notes-title">Catatan Khusus:</div>
            <div>{{ $order->catatan }}</div>
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p>Terima kasih telah mempercayakan acara Anda kepada HW Katering</p>
            <p>Invoice ini dibuat secara otomatis pada {{ \Carbon\Carbon::now()->format('d M Y H:i') }}</p>
            <div style="margin-top: 30px; text-align: left;">
                <p style="font-weight: bold; font-size: 10px; color: #2c3e50; margin-bottom: 3px;">
                    Informasi Pembayaran
                </p>
                <p style="line-height: 1.6;">
                    <strong>Heka Winarti</strong><br>
                    BCA: 3820058215<br>
                    BRI: 006801015145532
                </p>
            </div>
        </div>
    </div>
</body>

</html>
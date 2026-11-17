<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rincian Belanja Order #{{ $order['nomor_order'] }}</title>
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

        .invoice-info {
            display: table-cell;
            width: 40%;
            text-align: right;
            vertical-align: top;
        }

        .invoice-title {
            font-size: 20px;
            font-weight: bold;
            color: #e74c3c;
            margin-bottom: 3px;
        }

        .invoice-number {
            font-size: 12px;
            color: #555;
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

        .footer {
            margin-top: 20px;
            padding-top: 12px;
            text-align: center;
            font-size: 9px;
            color: #7f8c8d;
            line-height: 1.4;
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
                </div>
                <div class="invoice-info">
                    <div class="invoice-title">RINCIAN BELANJA</div>
                    <div class="invoice-number">Order #{{ $order['nomor_order'] }}</div>
                </div>
            </div>
        </div>

        <!-- Detail Bahan -->
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 40%;">Nama Bahan</th>
                    <th style="width: 15%;" class="text-center">Jumlah</th>
                    <th style="width: 10%;" class="text-center">Satuan</th>
                    <th style="width: 15%;" class="text-right">Harga Satuan</th>
                    <th style="width: 15%;" class="text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($rincian_belanja as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $item['nama'] }}</td>
                    <td class="text-center">{{ number_format($item['jumlah'], 1, ',', '.') }}</td>
                    <td class="text-center">{{ $item['satuan'] }}</td>
                    <td class="text-right">Rp {{ number_format($item['harga'], 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($item['subtotal'], 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Summary -->
        <div class="summary">
            <div class="summary-row summary-total">
                <div class="summary-label">TOTAL BELANJA:</div>
                <div class="summary-value">Rp {{ number_format($total_belanja, 0, ',', '.') }}</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Dokumen ini dibuat secara otomatis pada {{ \Carbon\Carbon::now()->format('d M Y H:i') }}</p>
        </div>
    </div>
</body>

</html>

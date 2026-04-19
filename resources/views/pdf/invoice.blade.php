<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $order->id }}</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; }
        .header { text-align: center; margin-bottom: 20px; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
        .table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
        .table th, .table td { padding: 8px; border: 1px solid #eee; }
        .table th { background: #f5f5f5; }
        .total { font-weight: bold; text-align: right; margin-top: 20px; }
        .info { margin-bottom: 20px; }
        .info div { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <h2>INVOICE ERP-SEGER</h2>
            <p>Order ID: #{{ $order->id }} | Tanggal: {{ $order->created_at->format('d/m/Y H:i') }}</p>
        </div>

        <div class="info">
            <strong>Kepada:</strong>
            <div>Nama: {{ $order->user->name }}</div>
            <div>NIK: {{ $order->user->nik }}</div>
            <div>Workplace: {{ $order->user->workplace?->name }}</div>
            <div>Alamat: {{ $order->shipping_address }}</div>
        </div>

        <div class="info">
            <strong>Metode Pembayaran:</strong>
            <div>{{ strtoupper($order->payment_method) }}</div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Harga</th>
                    <th>Jumlah</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->product->name }}</td>
                    <td>Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>Rp {{ number_format($item->price * $item->quantity, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="total">
            TOTAL PEMBAYARAN: Rp {{ number_format($order->total_price, 0, ',', '.') }}
        </div>

        <div style="margin-top: 50px; font-size: 12px; text-align: center; color: #777;">
            Terima kasih telah berbelanja di ERP-Seger.<br>
            Invoice ini sah dan dihasilkan secara otomatis oleh sistem.
        </div>
    </div>
</body>
</html>

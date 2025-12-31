import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register standard font if needed, otherwise use built-in Helvetica
// Font.register({ family: 'Geist', src: ... });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#4f46e5', // Indigo-600 placeholder
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 8,
    alignItems: 'center',
  },
  colName: { width: '50%', fontSize: 10 },
  colQty: { width: '15%', fontSize: 10, textAlign: 'center' },
  colPrice: { width: '20%', fontSize: 10, textAlign: 'right' },
  colTotal: { width: '15%', fontSize: 10, textAlign: 'right', fontWeight: 'bold' },
  totalSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#111827',
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 15,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 9,
    textAlign: 'center',
    color: '#9ca3af',
  },
});

export const InvoiceDocument = ({ order }: { order: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
             {/* Logo image relative to public folder - might need window.location.origin in client */}
             {/* Using a standard reliable placeholder if local image fails in PDF generation context, 
                 but trying the public path. React-PDF usually needs full URL or base64. 
                 For now assuming it resolves or providing a text fallback in design. 
             */}
             <Image src="/logo-boleta.png" style={{ width: 60, height: 60, objectFit: 'contain' }} />
             <View>
                <Text style={styles.title}>Market E.C</Text>
                <Text style={{ fontSize: 10, color: '#12753e', fontWeight: 'bold' }}>Tu mercado de confianza</Text>
             </View>
        </View>
        <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
             <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>RECIBO DE COMPRA</Text>
             <Text style={{ fontSize: 12, color: '#374151' }}>#{order.id.slice(-8).toUpperCase()}</Text>
             <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>{new Date(order.createdAt).toLocaleDateString("es-AR", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>

      {/* Info Sections */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, gap: 20 }}>
          {/* Seller / Platform Info */}
          <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 10, borderRadius: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#12753e', marginBottom: 4, textTransform: 'uppercase' }}>Vendedor / Tienda</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{order.items[0]?.product?.user?.name || "Market E.C"}</Text>
              <Text style={{ fontSize: 9, color: '#4b5563' }}>gestion@market-ec.com</Text>
              <Text style={{ fontSize: 9, color: '#4b5563' }}>Concordia, Entre Ríos</Text>
          </View>

          {/* Buyer Info */}
          <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 10, borderRadius: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#12753e', marginBottom: 4, textTransform: 'uppercase' }}>Cliente</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{order.customerName}</Text>
              <Text style={{ fontSize: 9, color: '#4b5563' }}>{order.customerEmail}</Text>
              <Text style={{ fontSize: 9, color: '#4b5563' }}>{order.customerPhone || "Sin teléfono"}</Text>
              <Text style={{ fontSize: 9, color: '#4b5563', marginTop: 2 }}>
                 {order.addressLine1}, {order.city}
              </Text>
          </View>
      </View>

      {/* Table Header */}
      <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: '#12753e', backgroundColor: '#f0fdf4', paddingVertical: 10 }]}>
          <Text style={[styles.colName, { fontWeight: 'bold', color: '#166534', paddingLeft: 8 }]}>PRODUCTO / SERVICIO</Text>
          <Text style={{ width: '15%', fontSize: 10, textAlign: 'center', fontWeight: 'bold', color: '#166534' }}>ID / SKU</Text>
          <Text style={[styles.colQty, { fontWeight: 'bold', color: '#166534' }]}>CANT.</Text>
          <Text style={[styles.colPrice, { fontWeight: 'bold', color: '#166534' }]}>UNITARIO</Text>
          <Text style={[styles.colTotal, { fontWeight: 'bold', color: '#166534', paddingRight: 8 }]}>SUBTOTAL</Text>
      </View>

      {/* Items */}
      {order.items.map((item: any, i: number) => (
         <View key={i} style={[styles.row, { borderBottomColor: '#e5e7eb' }]}>
            <Text style={[styles.colName, { paddingLeft: 8 }]}>{item.product.name}</Text>
            <Text style={{ width: '15%', fontSize: 9, textAlign: 'center', color: '#6b7280' }}>{(item.product?.id || '').slice(-6).toUpperCase()}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>$ {(item.priceCents / 100).toFixed(2)}</Text>
            <Text style={[styles.colTotal, { paddingRight: 8 }]}>$ {((item.priceCents * item.quantity) / 100).toFixed(2)}</Text>
         </View>
      ))}

      {/* Totals */}
      <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingVertical: 5 }}>
               <Text style={{ fontSize: 10, width: 100, textAlign: 'right', marginRight: 10 }}>Subtotal:</Text>
               <Text style={{ fontSize: 10, width: 80, textAlign: 'right', fontWeight: 'bold' }}>$ {(order.totalCents / 100).toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingVertical: 5 }}>
               <Text style={{ fontSize: 10, width: 100, textAlign: 'right', marginRight: 10 }}>Descuento:</Text>
               <Text style={{ fontSize: 10, width: 80, textAlign: 'right', fontWeight: 'bold' }}>$ 0.00</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#12753e' }}>
               <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#12753e', marginRight: 10 }}>TOTAL:</Text>
               <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#12753e', width: 100, textAlign: 'right' }}>$ {(order.totalCents / 100).toFixed(2)}</Text>
          </View>
          <View style={{ marginTop: 15, alignItems: 'flex-end' }}>
               <Text style={{ fontSize: 10, color: '#4b5563' }}>Método de Pago: {order.paymentMethod || 'No especificado'}</Text>
               <Text style={{ fontSize: 10, color: '#4b5563' }}>Estado: {order.status}</Text>
          </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
          <Text>Documento generado electrónicamente por Market E.C</Text>
          <Text style={{ marginTop: 4 }}>Ante cualquier duda o reclamo, contacte a soporte dentro de los 7 días hábiles.</Text>
          <Text style={{ marginTop: 10, fontSize: 8, color: '#d1d5db' }}>{order.id}</Text>
      </View>
    </Page>
  </Document>
);

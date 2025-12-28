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
      
      {/* Header */}
      <View style={styles.header}>
        <View>
             <Text style={styles.title}>Boleta de Pago</Text>
             <Text style={styles.subtitle}>ID: {order.id.toUpperCase()}</Text>
             <Text style={styles.subtitle}>Fecha: {new Date(order.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
             <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Tienda Online</Text>
             <Text style={{ fontSize: 10, color: '#6b7280' }}>Comprobante no válido como factura fiscal</Text>
        </View>
      </View>

      {/* Client Info */}
      <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>Cliente</Text>
          <Text style={{ fontSize: 10 }}>{order.customerName || 'Consumidor Final'}</Text>
          <Text style={{ fontSize: 10 }}>Método de Entrega: {order.deliveryMethod}</Text>
          <Text style={{ fontSize: 10 }}>Estado: {order.status}</Text>
      </View>

      {/* Table Header */}
      <View style={[styles.row, { borderBottomWidth: 2, borderBottomColor: '#000' }]}>
          <Text style={[styles.colName, { fontWeight: 'bold' }]}>Producto</Text>
          <Text style={[styles.colQty, { fontWeight: 'bold' }]}>Cant.</Text>
          <Text style={[styles.colPrice, { fontWeight: 'bold' }]}>Precio Unit.</Text>
          <Text style={[styles.colTotal, { fontWeight: 'bold' }]}>Total</Text>
      </View>

      {/* Items */}
      {order.items.map((item: any, i: number) => (
         <View key={i} style={styles.row}>
            <Text style={styles.colName}>{item.product.name}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>$ {(item.priceCents / 100).toFixed(2)}</Text>
            <Text style={styles.colTotal}>$ {((item.priceCents * item.quantity) / 100).toFixed(2)}</Text>
         </View>
      ))}

      {/* Totals */}
      <View style={styles.totalSection}>
          <Text style={styles.totalText}>TOTAL:</Text>
          <Text style={styles.totalValue}>$ {(order.totalCents / 100).toFixed(2)}</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
          Gracias por tu compra. Escanea el código QR en tu perfil para retirar tu pedido.
          Este documento es un comprobante interno de la plataforma.
      </Text>
    </Page>
  </Document>
);

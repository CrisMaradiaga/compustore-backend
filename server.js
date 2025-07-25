const express = require('express');
const stripe = require('stripe')('sk_test_51RoZPiDglk3LopJM5IdpafNQHBaTq4bQgPrdD4vWYKV0YZcNvPYqgdbrVOteHaDo4F4sl7vxh5lwTLgDqUifUx2W00wGdH2yEV');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint principal para crear Payment Intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    console.log(`💰 Creando Payment Intent por $${amount} ${currency.toUpperCase()}`);
    
    // Validar el monto
    if (!amount || amount < 0.50) {
      return res.status(400).json({
        error: 'El monto debe ser al menos $0.50'
      });
    }
    
    // Crear el Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        app: 'CompuStore',
        platform: 'iOS'
      },
      description: 'Compra en CompuStore - Productos de tecnología'
    });
    
    console.log(`✅ Payment Intent creado: ${paymentIntent.id}`);
    
    // Responder con el client secret y la clave publicable
    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: 'pk_test_51RoZPiDglk3LopJMDPWzOSQC5xURnQTozfbVjI0podoCuwOHG3fwaeJUsq4btGWfI9GXSezcN23Itp7oMALLc8yd00xeXVeCKO',
      paymentIntentId: paymentIntent.id
    });
    
  } catch (error) {
    console.error('❌ Error creando Payment Intent:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Endpoint de salud para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({
    message: '🚀 CompuStore Stripe Server funcionando correctamente!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /create-payment-intent': 'Crear intención de pago',
      'GET /health': 'Verificar estado del servidor'
    }
  });
});

// Endpoint adicional de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor CompuStore ejecutándose en puerto ${PORT}`);
  console.log(`📡 Endpoint principal: http://localhost:${PORT}/create-payment-intent`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Stripe configurado correctamente`);
});

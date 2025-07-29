const express = require('express');
const stripe = require('stripe')('sk_test_51RoZPiDglk3LopJM5IdpafNQHBaTq4bQgPrdD4vWYKV0YZcNvPYqgdbrVOteHaDo4F4sl7vxh5lwTLgDqUifUx2W00wGdH2yEV');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Endpoint principal para crear Payment Intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    console.log('📨 Recibida solicitud de Payment Intent');
    console.log('📦 Body:', req.body);
    
    const { amount, currency = 'usd' } = req.body;
    
    console.log(`💰 Creando Payment Intent por $${amount} ${currency.toUpperCase()}`);
    
    // Validar el monto
    if (!amount || amount < 0.50) {
      console.log('❌ Monto inválido:', amount);
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
    const response = {
      clientSecret: paymentIntent.client_secret,
      publishableKey: 'pk_test_51RoZPiDglk3LopJMDPWzOSQC5xURnQTozfbVjI0podoCuwOHG3fwaeJUsq4btGWfI9GXSezcN23Itp7oMALLc8yd00xeXVeCKO',
      paymentIntentId: paymentIntent.id
    };
    
    console.log('📤 Enviando respuesta exitosa');
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error creando Payment Intent:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Endpoint de salud para verificar que el servidor funciona
app.get('/', (req, res) => {
  console.log('📍 Acceso a endpoint raíz');
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
  console.log('🏥 Health check solicitado');
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  console.log(`❓ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Endpoint no encontrado',
    availableEndpoints: {
      'POST /create-payment-intent': 'Crear intención de pago',
      'GET /health': 'Verificar estado del servidor',
      'GET /': 'Información del servidor'
    }
  });
});

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor CompuStore ejecutándose en puerto ${PORT}`);
    console.log(`📡 Endpoint principal: http://localhost:${PORT}/create-payment-intent`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`💳 Stripe configurado correctamente`);
  });
}

// Exportar para Vercel
module.exports = app;

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const app = express();
const port = 3000;

const WebSocket = require('ws'); // WebSocket kütüphanesi

// HTTP sunucusu oluştur
const server = http.createServer(app);

// WebSocket sunucusu oluştur
const wss = new WebSocket.Server({ server });

// WebSocket bağlantılarını dinle
wss.on('connection', (ws) => {
  console.log('Yeni WebSocket bağlantısı kuruldu');

  // WebSocket ile mesaj gönderme
  ws.on('message', (message) => {
    console.log(`Gelen mesaj: ${message}`);
    
    // Mesajı tüm bağlı istemcilere gönder
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`${message}`);
      }
    });
  });

  // Bağlantı kapandığında
  ws.on('close', () => {
    console.log('WebSocket bağlantısı kapandı');
  });
});

function sendUpdate(update) {
  // WebSocket ile tüm istemcilere mesaj gönder
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(update));
    }
  });
}

// MongoDB bağlantısı
mongoose.connect('mongodb+srv://user:FCM4XCq9jrAXmHb0@couriertracking.sl45r.mongodb.net/CourierTracking?retryWrites=true&w=majority&appName=couriertracking')
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch((err) => console.error('MongoDB bağlantısı hatası:', err));

app.use(express.json());

// Restaurant Schema tanımı
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  }],
  couriersIDs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courier',
    required: true
  }],
  restaurantLocation: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  productModels: [{
    modelTitle: { type: String, required: true },
    products: [{
      productTitle: { type: String, required: true },
      productImage: { type: String },
      productPrice: { type: Number, required: true },
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true }
    }]
  }]
});


// Restaurant Model tanımı
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Order Schema tanımı
const orderSchema = new mongoose.Schema({
  restaurantID: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  courierID: { type: mongoose.Schema.Types.ObjectId, ref: 'Courier', required: true },
  customer: { type: String, required: true },
  status: { type: String, enum: ['Aktif Sipariş', 'Tamamlandı', 'İptal Edildi'], required: true },
  date: { type: Date, default: Date.now, required: true },
  customerLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  }
});
  
const Order = mongoose.model('Order', orderSchema);

// Courier Schema tanımı
const courierSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  password: { type: String, required: true },
  restaurantID: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true  }],
  active: { type: Boolean, required: true }, 
  currentLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  }
});

const Courier = mongoose.model('Courier', courierSchema);


// Restoran oluşturma
app.post('/restaurants', async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    const savedRestaurant = await restaurant.save();
    sendUpdate({ type: 'newRestaurant', restaurant: savedRestaurant });
    res.status(201).json(savedRestaurant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Tüm restoranları listeleme
app.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ID'ye göre restoran güncelleme
app.put('/restaurants/:id', async (req, res) => {
  try {
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRestaurant) {
      return res.status(404).json({ error: 'Restoran bulunamadı' });
    }
    res.status(200).json(updatedRestaurant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ID'ye göre restoran silme
app.delete('/restaurants/:id', async (req, res) => {
  try {
    const deletedRestaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!deletedRestaurant) {
      return res.status(404).json({ error: 'Restoran bulunamadı' });
    }
    res.status(200).json({ message: 'Restoran silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sipariş oluşturma
app.post('/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();
  
    // Siparişi restorana ekleme
    await Restaurant.findByIdAndUpdate(
      req.body.restaurantID,
      { $push: { orders: savedOrder._id } }
    );
  
    sendUpdate({ type: 'newOrder', order: savedOrder });
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
  
// Tüm siparişleri listeleme
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('restaurant').populate('courier');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
  
// ID'ye göre sipariş güncelleme
app.put('/orders/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
  
// ID'ye göre sipariş silme
app.delete('/orders/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    // Siparişi restorandan silme
    await Restaurant.findByIdAndUpdate(
      deletedOrder.restaurantID,
      { $pull: { orders: deletedOrder._id } }
    );
    await Courier.findByIdAndUpdate(
      deletedOrder.courierID,
      { $pull: { orders: deletedOrder._id } }
    );

    if (!deletedOrder) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    res.status(200).json({ message: 'Sipariş silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
  
// Kurye oluşturma
app.post('/couriers', async (req, res) => {
  try {
    const courier = new Courier(req.body);
    const savedCourier = await courier.save();
  
    // Kuryeyi restorana ekleme
    await Restaurant.findByIdAndUpdate(
      req.body.restaurantID,
      { $push: { couriersIDs: savedCourier._id } }
    );
  
    sendUpdate({ type: 'newCourier', courier: savedCourier });
    res.status(201).json(savedCourier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
  
// Tüm kuryeleri listeleme
app.get('/couriers', async (req, res) => {
  try {
    const couriers = await Courier.find().populate('restaurantID').populate('orders');
    res.status(200).json(couriers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ID'ye göre kurye güncelleme
app.put('/couriers/:id', async (req, res) => {
  try {
    const updatedCourier = await Courier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCourier) {
      return res.status(404).json({ error: 'Kurye bulunamadı' });
    }
    res.status(200).json(updatedCourier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ID'ye göre kurye silme
app.delete('/couriers/:id', async (req, res) => {
  try {
    const deletedCourier = await Courier.findByIdAndDelete(req.params.id);

    // Kuryeyi restorandan silme
    await Restaurant.findByIdAndUpdate(
      deletedCourier.restaurantID,
      { $pull: { couriersIDs: deletedCourier._id } }
    );

    if (!deletedCourier) {
      return res.status(404).json({ error: 'Kurye bulunamadı' });
    }
    res.status(200).json({ message: 'Kurye silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ID'ye göre restoran çekme
app.get('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('orders');
    if (!restaurant) {
      return res.status(404).json({ error: 'Restoran bulunamadı' });
    }
    res.status(200).json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ID'ye göre sipariş çekme
app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('restaurant').populate('courier');
    if (!order) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ID'ye göre kurye çekme
app.get('/couriers/:id', async (req, res) => {
  try {
    const courier = await Courier.findById(req.params.id).populate('restaurantID').populate('orders');
    if (!courier) {
      return res.status(404).json({ error: 'Kurye bulunamadı' });
    }
    res.status(200).json(courier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ID'ye göre kurye konumunu güncelleme
app.patch('/couriers/:id/currentlocation', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Geçerli bir konum girilmelidir (latitude ve longitude).' });
    }

    const updatedCourier = await Courier.findByIdAndUpdate(
      req.params.id,
      { 
        currentLocation: { latitude, longitude }
      },
      { new: true, runValidators: true }
    );

    // WebSocket ile konum güncelleme
    sendUpdate({ type: 'locationUpdate', courier: updatedCourier });

    if (!updatedCourier) {
      return res.status(404).json({ error: 'Kurye bulunamadı' });
    }

    res.status(200).json(updatedCourier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restorana ürün modeli ekleme
app.post('/restaurants/:id/product-models', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restoran bulunamadı' });
    }

    const newModel = {
      modelTitle: req.body.modelTitle,
      products: req.body.products // ürünlerin arrayi
    };

    restaurant.productModels.push(newModel);
    await restaurant.save();

    sendUpdate({ type: 'productModelAdded', restaurant });

    res.status(201).json(newModel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Restoranın ürün modellerini listeleme
app.get('/restaurants/:id/product-models', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restoran bulunamadı' });
    }
    res.status(200).json(restaurant.productModels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Ürün modelini güncelleme
app.put('/restaurants/:restaurantId/product-models/:modelId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restoran bulunamadı' });
    }

    const modelIndex = restaurant.productModels.findIndex(model => model._id.equals(req.params.modelId));
    if (modelIndex === -1) {
      return res.status(404).json({ error: 'Ürün modeli bulunamadı' });
    }

    restaurant.productModels[modelIndex] = { ...restaurant.productModels[modelIndex], ...req.body };
    await restaurant.save();

    sendUpdate({ type: 'productModelUpdated', restaurant });

    res.status(200).json(restaurant.productModels[modelIndex]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Ürün modelini silme
app.delete('/restaurants/:restaurantId/product-models/:modelId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restoran bulunamadı' });
    }

    restaurant.productModels = restaurant.productModels.filter(model => !model._id.equals(req.params.modelId));
    await restaurant.save();

    sendUpdate({ type: 'productModelDeleted', restaurant });

    res.status(200).json({ message: 'Ürün modeli silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Ürün modeli altına ürün ekleme
app.post('/restaurants/:restaurantId/product-models/:modelId/products', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restoran bulunamadı' });
    }

    const model = restaurant.productModels.id(req.params.modelId);
    if (!model) {
      return res.status(404).json({ error: 'Ürün modeli bulunamadı' });
    }

    const newProduct = {
      productTitle: req.body.productTitle,
      productImage: req.body.productImage,
      productPrice: req.body.productPrice
    };

    model.products.push(newProduct);
    await restaurant.save();

    sendUpdate({ type: 'productAdded', restaurant });

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Ürünü silme
app.delete('/restaurants/:restaurantId/product-models/:modelId/products/:productId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restoran bulunamadı' });
    }

    const model = restaurant.productModels.id(req.params.modelId);
    if (!model) {
      return res.status(404).json({ error: 'Ürün modeli bulunamadı' });
    }

    model.products = model.products.filter(product => !product._id.equals(req.params.productId));
    await restaurant.save();

    sendUpdate({ type: 'productDeleted', restaurant });

    res.status(200).json({ message: 'Ürün silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Sunucuyu başlat
server.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});

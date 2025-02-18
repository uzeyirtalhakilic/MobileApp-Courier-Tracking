export const ip = '192.168.62.5';
export const API_URL = `http://${ip}:3000`; // API URL de ip değişkenini kullanıyor

// Restoran fonksiyonları
export const fetchRestaurants = async () => {
  try {
    const response = await fetch(`${API_URL}/restaurants`);
    if (!response.ok) throw new Error('Restoranları getirirken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const fetchRestaurantById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/restaurants/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Restaurant fetching error:', error);
    throw error;
  }
};


export const createRestaurant = async (data) => {
  try {
    const response = await fetch(`${API_URL}/restaurants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Restoran eklerken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const updateRestaurant = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/restaurants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Restoranı güncellerken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const deleteRestaurant = async (id) => {
  try {
    const response = await fetch(`${API_URL}/restaurants/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Restoran silerken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

// Kurye fonksiyonları
export const fetchCouriers = async () => {
  try {
    const response = await fetch(`${API_URL}/couriers`);
    if (!response.ok) {
      throw new Error(`HTTP hata: ${response.status} - ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch hatası:', error.message);
    return []; // Eğer hata varsa, boş bir dizi döndürebilirsiniz
  }
};

// Belirli bir kuryeyi id ile getirir
export const fetchCourierById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/couriers/${id}`);
    if (!response.ok) throw new Error('Kurye getirirken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const createCourier = async (data) => {
  try {
    const response = await fetch(`${API_URL}/couriers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Kurye eklerken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const updateCourier = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/couriers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Kuryeyi güncellerken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const deleteCourier = async (id) => {
  try {
    const response = await fetch(`${API_URL}/couriers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Kurye silerken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

// Sipariş fonksiyonları
export const fetchOrders = async () => {
  try {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) throw new Error('Siparişleri getirirken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const fetchOrderById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`);
    if (!response.ok) throw new Error('Siparişi getirirken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const createOrder = async (data) => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Sipariş eklerken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const updateOrder = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Siparişi güncellerken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

export const deleteOrder = async (id) => {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Sipariş silerken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};

// Kurye konumunu güncelleyen fonksiyon
export const updateCurrentLocation = async (courierId, latitude, longitude) => {
  try {
    const response = await fetch(`${API_URL}/couriers/${courierId}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    });
    if (!response.ok) throw new Error('Kuryenin konumunu güncellerken bir hata oluştu.');
    return await response.json();
  } catch (error) {
    console.error('Konum güncellenirken bir hata oluştu:', error);
  }
};
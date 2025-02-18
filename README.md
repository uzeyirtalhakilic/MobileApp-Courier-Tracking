#  🛵 Courier Tracking System - Mobile Application 📱

This project is a **mobile application** developed using **React Native**. It works in **real-time** with the **Windows application** to provide a seamless **courier tracking and order management system**.

## ✨ Features
- **OpenStreetMap Integration** 🌍: Uses **OpenStreetMap** instead of Google Maps to display courier locations dynamically.
- **Real-Time Location Tracking** 📡: Couriers' locations are updated **instantly** via **WebSocket**, ensuring accurate tracking.
- **Order Management** 📦: Users can **view, manage, and track orders** efficiently.
- **Interactive UI** 🎨: A user-friendly and intuitive interface for managing deliveries and couriers.
- **Authentication System** 🔑: Includes login screens inspired by popular Turkish delivery services like **Getir, Trendyol Yemek, and Yemeksepeti**.
- **Seamless Windows Integration** 🖥️: Works alongside the **Windows application** to synchronize courier data and orders in real-time.

## 🛠️ Technologies Used
- **React Native** (for mobile development)
- **React Navigation** (for seamless navigation between screens)
- **WebSocket** (for real-time location tracking)
- **MongoDB** (for backend database storage)

## 🚀 Installation
1. **Install Node.js and React Native**: Follow the [React Native Installation Guide](https://reactnative.dev/docs/environment-setup)
2. Clone the project:
   ```bash
   git clone https://github.com/your_username/MobileApp-Courier-Tracking.git
   cd MobileApp-Courier-Tracking
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

4. Configure the Data Folder
In the Data folder, open the configuration file and modify the IP field to use your own server IP address.

5. Navigate to the mobileapp folder from [MobileApp](https://github.com/uzeyirtalhakilic/MobileApp-Courier-Tracking):
    Start the server by running the following commands
     ```bash
      cd server
      node index
     ```
6. Start the application:
   ```bash
   npx react-native run-android   # For Android
   npx react-native run-ios       # For iOS (MacOS required)
   ```

## 🖥️ Windows Application
This mobile application **works together** with a **Windows version** to provide an integrated courier tracking system.
👉 [Windows Application Repository](https://github.com/uzeyirtalhakilic/DesktopApp-Courier-Tracking)

## 🤝 Contributing
If you would like to contribute to this project, feel free to submit a **pull request** or open an **issue**.

## 📌 Note
This project is **a student project**, developed solely **for learning and self-improvement purposes**.


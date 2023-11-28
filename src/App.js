// This is a React web app that can display and manage orders from a Firestore database
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, collection, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import './App.css'; // Import the stylesheet

// Use a .env file to store the Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD0n3mxcC6XiFAGlaYMaD8lAA-2ohT8B6M',
  authDomain: 'laundry-1553d.firebaseapp.com',
  projectId: 'laundry-1553d',
  storageBucket: 'laundry-1553d.appspot.com',
  messagingSenderId: '845107868342',
  appId: '1:845107868342:web:dadf79c330ca63a830ec17',
  measurementId: 'G-FRYFGG9ZR5',
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Context setup
const AppContext = createContext();

function AppProvider({ children }) {
  const [orders, setOrders] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const ordersCollection = await getDocs(collection(firestore, 'Orders'));
      const ordersData = ordersCollection.docs.map((doc) => ({
        orderId: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [firestore]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = useCallback(async (orderId, newStatus) => {
    try {
      console.log('Updating status...', orderId, newStatus);

      // Update the status field in the Firestore document
      await updateDoc(doc(firestore, 'Orders', orderId), {
        status: newStatus,
      });

      console.log('Status updated successfully.');
      fetchData(); // Refresh the data
      showAlert('Status Updated Successfully', 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showAlert('Error Updating Status', 'error');
    }
  }, [firestore, fetchData]);

  const handleDeleteOrder = useCallback(async (orderId) => {
    try {
      console.log('Deleting order...', orderId);

      // Delete the document from Firestore
      await deleteDoc(doc(firestore, 'Orders', orderId));

      console.log('Order deleted successfully.');
      fetchData(); // Refresh the data
      showAlert('Order Deleted Successfully', 'success');
    } catch (error) {
      console.error('Error deleting order:', error);
      showAlert('Error Deleting Order', 'error');
    }
  }, [firestore, fetchData]);

  const showAlert = (message, type) => {
    alert(`${type.toUpperCase()}: ${message}`);
  };

  return (
    <AppContext.Provider value={{ orders, handleUpdateStatus, handleDeleteOrder }}>
      {children}
    </AppContext.Provider>
  );
}

function useAppContext() {
  return useContext(AppContext);
}

function OrderList() {
  const { orders, handleUpdateStatus, handleDeleteOrder } = useAppContext();

  return (
    <ul className="order-list">
      {orders.map((order) => (
        <li key={order.orderId} className="order-item">
          <div className="order-details">
            <strong>Order ID:</strong> {order.orderId}
            <br />
            <strong>Status:</strong> {order.status}
            <br />
            <strong>Username:</strong> {order.username}
            <br />
            <strong>Delivery Address:</strong> {order.deliveryAddress}
            <br />
            <strong>Pickup Time:</strong> {order.pickupTime}
            <br />
            <strong>Drop Time:</strong> {order.dropTime}
            <br />
            <strong>Total Amount:</strong> {order.totalAmount}
            <br />
            <strong>Special Instructions:</strong> {order.specialInstructions}
            <br />
            <strong>Timestamp:</strong> {order.timestamp && order.timestamp.toDate().toLocaleString()}
            <br />
            <strong>Cart Items:</strong>
            <ul className="cart-items">
              {order.cartItems.map((item, index) => (
                <li key={index}>
                  <div>
                    <strong>Item Name:</strong> {item.itemName}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {item.quantity}
                  </div>
                  <div>
                    <strong>Work Type:</strong> {item.workType}
                  </div>
                  <div>
                    <strong>Item Price:</strong> {item.itemPrice}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="button-container">
            <button
              onClick={() => {
                switch (order.status) {
                  case 'Order Placed':
                  case 'Order Initiated':
                    handleUpdateStatus(order.orderId, 'Order Confirmed');
                    break;
                  case 'Order Confirmed':
                    handleUpdateStatus(order.orderId, 'Order Picked Up');
                    break;
                  case 'Order Picked Up':
                    handleUpdateStatus(order.orderId, 'Order Done');
                    break;
                  case 'Order Done':
                    handleUpdateStatus(order.orderId, 'Order Delivered');
                    break;
                  default:
                    console.log('Unexpected status:', order.status);
                }
              }}
            >
              Update Status
            </button>
            <button onClick={() => handleDeleteOrder(order.orderId)}>Delete Order</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function App() {
  return (
    <div className="app-container">
      <h1>Laundry Management</h1>
      <AppProvider>
        <OrderList />
      </AppProvider>
    </div>
  );
}

export default App;

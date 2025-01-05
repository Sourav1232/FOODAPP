import React, { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database"; // Import remove for deletion
import { database } from "../firebase"; 
import "./Inventory.css";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const inventoryRef = ref(database, "/");

    const handleData = (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const formattedInventory = Object.keys(data).map((category) => ({
            category,
            items: Object.keys(data[category]).map((itemName) => ({
              name: itemName,
              quantity: data[category][itemName].count,
              expiry: data[category][itemName].exp_date,
              key: `${category}/${itemName}` // Store the key path for deletion
            })),
          }));
          setInventory(formattedInventory);
        } else {
          setInventory([]);
        }
      } catch (err) {
        setError("Failed to fetch data from Firebase: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    onValue(
      inventoryRef,
      handleData,
      (error) => {
        setError("Error fetching data from Firebase: " + error.message);
        setLoading(false);
      }
    );

    return () => {
      setLoading(true);
      setError(null);
    };
  }, []);

  const handleDelete = (key) => {
    const itemRef = ref(database, key);
    remove(itemRef)
      .then(() => {
        setInventory((prevInventory) =>
          prevInventory.map((category) => ({
            ...category,
            items: category.items.filter((item) => item.key !== key),
          }))
        );
      })
      .catch((err) => {
        setError("Failed to delete item: " + err.message);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1>INVENTORY</h1>
      </div>
      <div className="inventory-content">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Type of Food</th>
              <th>Food Item</th>
              <th>Quantity</th>
              <th>Expiry Date</th>
              <th>Actions</th> {/* New column for actions */}
            </tr>
          </thead>
          <tbody>
            {inventory.length > 0 ? (
              inventory.map((category) =>
                category.items.length > 0 ? (
                  category.items.map((item, index) => (
                    <tr key={`${category.category}-${index}`}>
                      {index === 0 && (
                        <td rowSpan={category.items.length}>
                          {category.category}
                        </td>
                      )}
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.expiry || "N/A"}</td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(item.key)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key={category.category}>
                    <td rowSpan="1">{category.category}</td>
                    <td colSpan="4">[empty]</td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No inventory data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;

import { useEffect, useState } from "react";
import ChatPanel from "./ChatPanel";
import nlp from "compromise";

// Helper functions outside component

function extractFilters(text) {
  const doc = nlp(text.toLowerCase());

  // Extract location names
  let location = null;
  const places = doc.places().out("text");
  if (places) location = places;

  // Numbers may represent price or bedrooms depending on keywords
  let maxPrice = Infinity;
  let bedrooms = null;

  const numbers = doc.numbers().toNumber().out("array");
  numbers.forEach((num) => {
    if (text.includes("lakh") || text.includes("lac")) {
      maxPrice = Math.min(maxPrice, Number(num) * 100000);
    } else if (
      text.includes("bhk") ||
      text.includes("bedroom") ||
      text.includes("bedrooms")
    ) {
      bedrooms = num;
    }
  });

  // Property type manual fallback
  let propertyType = null;
  if (text.includes("villa")) propertyType = "villa";
  else if (text.includes("apartment")) propertyType = "apartment";
  else if (text.includes("studio")) propertyType = "studio";
  else if (text.includes("condo")) propertyType = "condo";

  return { location, maxPrice, bedrooms, propertyType };
}

function performPropertySearch(properties, text) {
  const { location, maxPrice, bedrooms, propertyType } = extractFilters(text);

  return properties.filter((p) => {
    if (location && !p.location.toLowerCase().includes(location)) return false;
    if (p.price > maxPrice) return false;
    if (bedrooms !== null && p.bedrooms !== bedrooms) return false;
    if (propertyType && !p.title.toLowerCase().includes(propertyType)) return false;
    return true;
  });
}

function App() {
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");

  const user = "demo@email.com";

  useEffect(() => {
    fetch("http://localhost:5001/api/properties")
      .then((res) => res.json())
      .then((data) => setProperties(data));
  }, []);

  const fetchFavorites = async () => {
    const res = await fetch(
      `http://localhost:5001/api/favorites?user=${encodeURIComponent(user)}`
    );
    if (res.ok) {
      const data = await res.json();
      setFavorites(data.map((f) => String(f.propertyId)));
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const saveFavorite = async (propertyId) => {
    const res = await fetch("http://localhost:5001/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, propertyId }),
    });
    if (res.ok) {
      fetchFavorites();
      alert("Saved to favorites!");
    } else alert("Error saving favorite");
  };

  const removeFavorite = async (propertyId) => {
    const res = await fetch("http://localhost:5001/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, propertyId }),
    });
    if (res.ok) {
      fetchFavorites();
      alert("Removed from favorites!");
    } else alert("Error removing favorite");
  };

  // Chatbot handler using NLP-enhanced filtering
  const handleChatInput = (text, addMessage) => {
    addMessage({ sender: "bot", text: "Searching for properties..." });
    const results = performPropertySearch(properties, text);

    setTimeout(() => {
      if (results.length === 0) {
        addMessage({
          sender: "bot",
          text: "Sorry, no properties found matching your criteria.",
        });
        return;
      }
      addMessage({
        sender: "bot",
        text: `Found ${results.length} matching properties. Showing top 5:`,
      });
      results.slice(0, 5).forEach((p) => {
        addMessage({
          sender: "bot",
          text: `${p.title} in ${p.location}, ₹${p.price}`,
        });
      });
    }, 1000);
  };

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      String(p.price).includes(search)
  );

  const favoriteProps = properties.filter((p) =>
    favorites.includes(String(p.id))
  );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        padding: "10px",
        gap: "20px",
      }}
    >
      <ChatPanel onUserMessage={handleChatInput} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "10px" }}>
          Property Listings
        </h1>

        <input
          type="text"
          placeholder="Search by name, location, or price"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px 16px",
            fontSize: "1rem",
            borderRadius: "22px",
            border: "none",
            width: "340px",
            boxShadow: "0 1px 10px #0002",
            marginBottom: "30px",
          }}
        />

        <h2>Saved Favorites</h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            marginBottom: "30px",
          }}
        >
          {favoriteProps.length > 0 ? (
            favoriteProps.map((p) => (
              <div
                key={p.id}
                style={{
                  borderRadius: "16px",
                  background: "#2c2734",
                  width: "280px",
                  boxShadow: "0 4px 16px #0007",
                  border: "1px solid #333",
                  overflow: "hidden",
                }}
              >
                <img
                  src={p.image_url}
                  alt={p.title}
                  style={{ width: "100%", height: "120px", objectFit: "cover" }}
                />
                <div style={{ padding: "14px" }}>
                  <h3 style={{ color: "#fff", fontSize: "1.1rem" }}>{p.title}</h3>
                  <p style={{ color: "#DDD" }}>Location: {p.location}</p>
                  <p style={{ color: "#DDD" }}>Price: ₹{p.price}</p>
                  <button
                    onClick={() => removeFavorite(p.id)}
                    style={{
                      marginTop: "10px",
                      padding: "6px 12px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Remove from Favorites
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#888" }}>No favorites saved yet.</p>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
          {filteredProperties.map((p) => (
            <div
              key={p.id}
              style={{
                borderRadius: "16px",
                background: "#222",
                boxShadow: "0 4px 16px #0007",
                width: "320px",
                overflow: "hidden",
                marginBottom: "10px",
                border: "1px solid #333",
                cursor: "pointer",
              }}
            >
              <img
                src={p.image_url}
                alt={p.title}
                style={{ width: "100%", height: "170px", objectFit: "cover" }}
              />
              <div style={{ padding: "18px" }}>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    margin: 0,
                    color: "#fff",
                  }}
                >
                  {p.title}
                </h2>
                <p style={{ color: "#BBB", margin: "7px 0" }}>
                  Location: {p.location}
                </p>
                <p style={{ color: "#BBB", marginTop: 0 }}>
                  Price: ₹{p.price}
                </p>
                <button
                  onClick={() => saveFavorite(p.id)}
                  disabled={favorites.includes(String(p.id))}
                  style={{
                    marginTop: "16px",
                    padding: "8px 16px",
                    borderRadius: "14px",
                    border: "none",
                    background: favorites.includes(String(p.id))
                      ? "#aaa"
                      : "#4CAF50",
                    color: "white",
                    fontWeight: "bold",
                    cursor: favorites.includes(String(p.id))
                      ? "not-allowed"
                      : "pointer",
                    boxShadow: "0 1px 4px #0003",
                  }}
                >
                  {favorites.includes(String(p.id))
                    ? "✓ Favorited"
                    : "♥ Save to Favorites"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

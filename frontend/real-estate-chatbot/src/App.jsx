import { useEffect, useState } from "react";
import ChatPanel from "./ChatPanel";
import nlp from "compromise";

// Simple Levenshtein distance for fuzzy matching (small strings only)
function levenshtein(a = "", b = "") {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

// NLP-based extraction function
function extractFilters(text) {
  const doc = nlp(text.toLowerCase());

  // Extract likely locations (prefer NLP places, fallback to 'in <place>' or 'near <place>')
  let location = null;
  const places = doc.places().out("array");
  if (places.length > 0) location = places[0].toLowerCase();
  else {
    const inMatch = text.match(/(?:in|near|at)\s+([a-zA-Z ]{2,30})/i);
    if (inMatch) location = inMatch[1].trim().toLowerCase();
  }

  // Helper to convert shorthand units like lakh/crore/k/m
  function parseNumberWithUnit(nStr, unit) {
    const v = Number(String(nStr).replace(/[,\s]/g, "")) || 0;
    if (!unit) return v;
    unit = unit.toLowerCase();
    if (unit.includes('lakh') || unit === 'lac') return v * 100000;
    if (unit.includes('crore')) return v * 10000000;
    if (unit === 'k') return v * 1000;
    if (unit === 'm' || unit.includes('million')) return v * 1000000;
    return v;
  }

  // Price parsing: supports 'under 50 lakh', 'below 1 crore', 'between 20 lakh and 50 lakh', 'max 5000000'
  let minPrice = 0;
  let maxPrice = Infinity;
  const betweenMatch = text.match(/between\s+(\d+[\d.,]*)\s*(lakh|lac|crore|k|m|million)?\s*(?:and|-|to)\s*(\d+[\d.,]*)\s*(lakh|lac|crore|k|m|million)?/i);
  if (betweenMatch) {
    const a = parseNumberWithUnit(betweenMatch[1], betweenMatch[2]);
    const b = parseNumberWithUnit(betweenMatch[3], betweenMatch[4]);
    minPrice = Math.min(a, b);
    maxPrice = Math.max(a, b);
  } else {
    // look for phrases like 'under 50 lakh' or 'below 1 crore' or 'up to 50 lakh'
  const underMatch = text.match(/(?:under|below|less than|up to|upto|max|min|max price|below)\s+(\d+[\d.,]*)\s*(lakh|lac|crore|k|m|million)?/i);
    if (underMatch) {
      maxPrice = parseNumberWithUnit(underMatch[1], underMatch[2]);
    }
  const overMatch = text.match(/(?:over|above|more than|min price|at least)\s+(\d+[\d.,]*)\s*(lakh|lac|crore|k|m|million)?/i);
    if (overMatch) {
      minPrice = parseNumberWithUnit(overMatch[1], overMatch[2]);
    }
    // direct price mentions like '50 lakh' or '1 crore'
  const directMatches = [...text.matchAll(/(\d+[\d.,]*)(?:\s*)(lakh|lac|crore|k|m|million)?/ig)];
    // If no other context, assume first direct number is a maxPrice (e.g., 'properties under 50 lakh' already handled)
    if (directMatches.length > 0 && maxPrice === Infinity && minPrice === 0) {
      // choose the first reasonable match
      const dm = directMatches[0];
      const val = parseNumberWithUnit(dm[1], dm[2]);
      // If the sentence contains words like 'budget' or 'price' consider it as maxPrice
      if (/price|budget|cost|under|below|upto|up to|max|min|less than|crore|lakh|lac/i.test(text)) {
        maxPrice = val;
      }
    }
  }

  // Bedrooms parsing: 2 bhk, 3 bedroom, 'two bhk'
  let bedrooms = null;
  const bhkMatch = text.match(/(\d+)\s*(?:bhk|bedroom|bedrooms|beds|bed)/i);
  if (bhkMatch) bedrooms = Number(bhkMatch[1]);
  else {
    // number words up to ten
    const words = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10 };
    const wordMatch = text.match(/(one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:bhk|bedroom|bedrooms|beds|bed)/i);
    if (wordMatch) bedrooms = words[wordMatch[1].toLowerCase()];
  }

  // Property type context
  let propertyType = null;
  if (text.includes("villa")) propertyType = "villa";
  else if (text.includes("apartment")) propertyType = "apartment";
  else if (text.includes("studio")) propertyType = "studio";
  else if (text.includes("condo")) propertyType = "condo";

  // Amenities detection (simple keywords)
  const amenitiesKeywords = ["gym","swimming","pool","parking","garden","balcony","beach","security","laundry","elevator","garage","rooftop","concierge","pet friendly","solar"];
  const amenities = amenitiesKeywords.filter(k => text.includes(k));

  return { location, minPrice, maxPrice, bedrooms, propertyType, amenities };
}

function performPropertySearch(properties, text) {
  const { location, minPrice, maxPrice, bedrooms, propertyType, amenities } = extractFilters(text);

  // Score each property and return a sorted list by relevance
  const scored = properties.map(p => {
    let score = 0;
    const title = (p.title || "").toLowerCase();
    const loc = (p.location || "").toLowerCase();

    // Location match gives strong signal
    if (location) {
      if (loc === location) score += 50;
      else if (loc.includes(location)) score += 30;
      else if (title.includes(location)) score += 15;
    }

    // Price range
    if (typeof p.price === 'number') {
      if (p.price >= (minPrice || 0) && p.price <= (maxPrice || Infinity)) score += 30;
      else {
        // small proximity credit if close to range
        if (maxPrice !== Infinity && Math.abs(p.price - maxPrice) / Math.max(1, maxPrice) < 0.15) score += 5;
      }
    }

    // Bedrooms match
    if (bedrooms !== null) {
      if (p.bedrooms === bedrooms) score += 20;
      else if (Math.abs((p.bedrooms || 0) - bedrooms) === 1) score += 8;
    }

    // Property type
    if (propertyType) {
      if (title.includes(propertyType)) score += 15;
    }

    // Amenities
    if (amenities && amenities.length > 0 && Array.isArray(p.amenities)) {
      const matched = p.amenities.filter(a => {
        const aLow = String(a).toLowerCase();
        return amenities.some(k => aLow.includes(k));
      });
      score += matched.length * 6;
    }

    // Base popularity/price weighting (prefer cheaper within same score)
    const priceBonus = 0;

    return { p, score: score + priceBonus };
  });

  // Filter out properties that clearly don't match location/price/bedrooms restrictions
  const filtered = scored.filter(item => {
    const p = item.p;
    if (location && !((p.location||"").toLowerCase().includes(location) || (p.title||"").toLowerCase().includes(location))) return item.score > 10; // allow small matches
    if (typeof p.price === 'number') {
      if (p.price < (minPrice || 0)) return false;
      if (maxPrice !== Infinity && p.price > maxPrice) return false;
    }
    if (bedrooms !== null && p.bedrooms !== bedrooms && Math.abs((p.bedrooms||0)-bedrooms) > 1) return false;
    return true;
  });

  // Sort descending by score then ascending by price
  filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.p.price || 0) - (b.p.price || 0);
  });

  return filtered.map(item => item.p);
}

function App() {
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(null);
  const user = "demo@email.com";

  useEffect(() => {
    fetch("http://localhost:5001/api/properties")
      .then((res) => res.json())
      .then((data) => setProperties(data));
  }, []);

  // Favorites logic
  const fetchFavorites = async () => {
    const res = await fetch(`http://localhost:5001/api/favorites?user=${encodeURIComponent(user)}`);
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

  // ChatBot Logic using NLP
  // Scroll/highlight a property card when a chat result is clicked
  const scrollToProperty = (id) => {
    setHighlighted(id);
    const el = document.getElementById(`property-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    // remove highlight after a short delay
    setTimeout(() => setHighlighted(null), 4000);
  };

  const handleChatInput = (text, addMessage) => {
    // Echo typing message
    addMessage({ sender: "bot", text: "Let me check..." });

    // Extract filters and look for ambiguous cases
    const filters = extractFilters(text);

    // 1) Bedrooms ambiguous pattern like '2 or 3' or '2-3'
  const ambBeds = text.match(/(\d+)\s*(?:or|to|-|\/|\s)\s*(\d+)/i);
    if (ambBeds) {
      const a = Number(ambBeds[1]);
      const b = Number(ambBeds[2]);
      addMessage({ sender: "bot", text: `Did you mean ${a} BHK or ${b} BHK?`, suggestions: [String(a), String(b)] });
      return;
    }

    // 2) Location fuzzy match: try to match against known property locations
    if (!filters.location && properties.length > 0) {
      // pick candidate words from user input
      const tokens = text.toLowerCase().split(/[^a-zA-Z0-9]+/).filter(Boolean);
      let best = null;
      for (const prop of properties) {
        const loc = (prop.location || "").toLowerCase();
        for (const tok of tokens) {
          if (!tok) continue;
          // exact include
          if (loc.includes(tok) || (prop.title || "").toLowerCase().includes(tok)) {
            best = loc;
            break;
          }
          // fuzzy: small edit distance
          const d = levenshtein(tok, loc.split(/[,-]/)[0].trim());
          if ((best === null || d < best.d) && d <= 2) {
            best = { loc, d };
          }
        }
        if (best && typeof best === 'string') break;
      }
      if (best && typeof best === 'object' && best.loc) {
        const candidate = best.loc;
        addMessage({ sender: 'bot', text: `Did you mean "${candidate}"?`, suggestions: [candidate, 'No, something else'] });
        return;
      }
    }

    // 3) Price approximate: if user said 'around' or similar, ask quick clarify
    if (/around|about|approx|~|approximately/i.test(text) && (filters.maxPrice !== Infinity || filters.minPrice > 0)) {
      const approxVal = filters.maxPrice !== Infinity ? filters.maxPrice : filters.minPrice || null;
      if (approxVal) {
        addMessage({ sender: 'bot', text: `Do you mean properties up to ₹${approxVal.toLocaleString()} or a range around it?`, suggestions: [`Up to ${approxVal}`, `Range ${Math.floor(approxVal*0.8)}-${Math.ceil(approxVal*1.2)}`] });
        return;
      }
    }

    // If no clarifications needed, perform the search
    const results = performPropertySearch(properties, text);

    setTimeout(() => {
      if (results.length === 0) {
        addMessage({ sender: "bot", text: "Sorry, no properties found matching your criteria." });
        return;
      }
      addMessage({ sender: "bot", text: `Found ${results.length} matching properties. Showing top 5:` });
      results.slice(0, 5).forEach((p) => {
        // send a result message with a linkable property id for clicking
        addMessage({ sender: "bot", text: `${p.title} in ${p.location}, ₹${p.price}`, type: 'result', propertyId: p.id });
      });
    }, 800);
  };

  // Normal UI search
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
    <div style={{ display: "flex", height: "100vh", padding: "10px", gap: "20px" }}>
      <ChatPanel onUserMessage={handleChatInput} onResultClick={scrollToProperty} />

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
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "30px" }}>
          {favoriteProps.length > 0 ? (
                favoriteProps.map((p) => (
              <div
                id={`property-${p.id}`}
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
              id={`property-${p.id}`}
              key={p.id}
              style={{
                borderRadius: "16px",
                background: "#222",
                boxShadow: highlighted === String(p.id) || highlighted === p.id ? "0 0 0 3px #66b2ff66" : "0 4px 16px #0007",
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
                  style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#fff" }}
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
                    background: favorites.includes(String(p.id)) ? "#aaa" : "#4CAF50",
                    color: "white",
                    fontWeight: "bold",
                    cursor: favorites.includes(String(p.id)) ? "not-allowed" : "pointer",
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

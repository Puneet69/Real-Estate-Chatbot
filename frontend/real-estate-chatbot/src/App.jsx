import { useEffect, useState } from "react";
import ChatPanel from "./ChatPanel";
import PropertyModal from "./PropertyModal";
import "./App.css";
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

// parse numbers with units (lakh/crore/k/m/million)
function parseNumberWithUnitGlobal(nStr, unit) {
  const v = Number(String(nStr).replace(/[_,\s]/g, "")) || 0;
  if (!unit) return v;
  unit = String(unit).toLowerCase();
  if (unit.includes('lakh') || unit === 'lac') return v * 100000;
  if (unit.includes('crore')) return v * 10000000;
  if (unit === 'k') return v * 1000;
  if (unit === 'm' || unit.includes('million')) return v * 1000000;
  return v;
}

function parseNumberOrWord(s) {
  if (!s) return null;
  const clean = String(s).trim().toLowerCase();
  const words = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10 };
  if (words[clean] !== undefined) return words[clean];
  // match patterns like '50 lakh' or '1.5 crore'
  const m = clean.match(/(\d+[\d.,]*)(?:\s*)(lakh|lac|crore|k|m|million)?/i);
  if (m) {
    return parseNumberWithUnitGlobal(m[1], m[2]);
  }
  // plain number
  const n = Number(clean.replace(/[_,]/g, ''));
  return Number.isFinite(n) ? n : null;
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
  // use global parser for units

  // Price parsing: supports 'under 50 lakh', 'below 1 crore', 'between 20 lakh and 50 lakh', 'max 5000000'
  let minPrice = 0;
  let maxPrice = Infinity;
  const betweenMatch = text.match(/between\s+(\d+[\d.,]*)\s*(lakh|lac|crore|k|m|million)?\s*(?:and|-|to)\s*(\d+[\d.,]*)\s*(lakh|lac|crore|k|m|million)?/i);
  if (betweenMatch) {
    const a = parseNumberWithUnitGlobal(betweenMatch[1], betweenMatch[2]);
    const b = parseNumberWithUnitGlobal(betweenMatch[3], betweenMatch[4]);
    minPrice = Math.min(a, b);
    maxPrice = Math.max(a, b);
  } else {
    // look for phrases like 'under 50 lakh' or 'below 1 crore' or 'up to 50 lakh'
    const underMatch = text.match(/(?:under|below|less than|up to|upto|max|min|max price|below)\s+(\d+[\d.,]*)\s*(lakh|lac|crore|k|m|million)?/i);
    if (underMatch) {
      maxPrice = parseNumberWithUnitGlobal(underMatch[1], underMatch[2]);
    }
  const overMatch = text.match(/(?:over|above|more than|min price|at least)\s+(\d+[\d.,]*)\s*(lakh|lac|crore|k|m|million)?/i);
    if (overMatch) {
      minPrice = parseNumberWithUnitGlobal(overMatch[1], overMatch[2]);
    }
    // direct price mentions like '50 lakh' or '1 crore'
  const directMatches = [...text.matchAll(/(\d+[\d.,]*)(?:\s*)(lakh|lac|crore|k|m|million)?/ig)];
    // If no other context, assume first direct number is a maxPrice (e.g., 'properties under 50 lakh' already handled)
    if (directMatches.length > 0 && maxPrice === Infinity && minPrice === 0) {
      // choose the first reasonable match
      const dm = directMatches[0];
      const val = parseNumberWithUnitGlobal(dm[1], dm[2]);
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

  // Check if user wants ONLY a specific location
  const isExclusiveLocation = /only.*in|in.*only|just.*in|specifically.*in|in\s+[a-z]+|show.*in|properties.*in/i.test(text);

  // Score each property and return a sorted list by relevance
  const scored = properties.map(p => {
    let score = 0;
    const title = (p.title || "").toLowerCase();
    const loc = (p.location || "").toLowerCase();

    // Location match gives strong signal
    if (location) {
      if (loc === location || loc.includes(location)) {
        score += 50;
      } else if (title.includes(location)) {
        score += 15;
      } else if (isExclusiveLocation || location) {
        // If user specified a location, exclude non-matching properties
        return { p, score: -1 };
      }
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
    
    // Exclude properties with negative scores (failed exclusive location match)
    if (item.score < 0) return false;
    
    // Strict location filtering - if location is specified, only show matching properties
    if (location) {
      const propertyLocation = (p.location || "").toLowerCase();
      const propertyTitle = (p.title || "").toLowerCase();
      
      // Check if property location contains the requested location
      if (!propertyLocation.includes(location) && !propertyTitle.includes(location)) {
        return false; // Exclude properties that don't match the requested location
      }
    }
    
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
  // Backend base URL (configurable via Vite env variable VITE_BACKEND_URL)
  const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5008';
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  // Filters
  const [filterLocation, setFilterLocation] = useState("Any");
  const [filterMinPrice, setFilterMinPrice] = useState(0);
  const [filterMaxPrice, setFilterMaxPrice] = useState(0);
  const [filterType, setFilterType] = useState("Any");
  const [highlighted, setHighlighted] = useState(null);
  // Guided search state
  const [guidedMode, setGuidedMode] = useState(false);
  const [guidedStep, setGuidedStep] = useState(-1);
  const [guidedAnswers, setGuidedAnswers] = useState({});
  const [chatAddMessage, setChatAddMessage] = useState(null);
  const user = "demo@email.com";

  useEffect(() => {
    fetch(`${BACKEND}/api/properties`)
      .then((res) => res.json())
      .then((data) => setProperties(data));
  }, []);

  // Favorites logic
  const fetchFavorites = async () => {
  const res = await fetch(`${BACKEND}/api/favorites?user=${encodeURIComponent(user)}`);
    if (res.ok) {
      const data = await res.json();
      setFavorites(data.map((f) => String(f.propertyId)));
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const saveFavorite = async (propertyId) => {
  const res = await fetch(`${BACKEND}/api/favorites`, {
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
  const res = await fetch(`${BACKEND}/api/favorites`, {
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

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  const closePropertyModal = () => {
    setShowPropertyModal(false);
    setSelectedProperty(null);
  };

  const handleChatInput = (text, addMessage) => {
    // If guided mode active, handle guided answers
    if (guidedMode) {
      handleGuidedAnswer(text, addMessage);
      return;
    }
    // Try the lightweight AI responder first (includes conversational handling)
    try {
      const handled = generateAIResponse(text, addMessage);
      if (handled) return;
    } catch {
      // if AI responder fails for any reason, fall back to old flows
    }

    // Only show "Let me check..." for actual property searches
    addMessage({ sender: "bot", text: "Let me check..." });

    // Fire-and-forget: also ask the hosted AI for a conversational reply so the chat
    // always returns an assistant-style response. This runs in background and will
    // append the assistant reply when available. It won't block property search.
    (async () => {
      try {
        const systemPrompt = `You are Ryna, a friendly and knowledgeable AI real estate assistant. You help users find properties, answer questions about real estate, and provide expert guidance. Always respond in a helpful, professional, and personable way. User query: ${text}`;
        const resp = await fetch(`${BACKEND}/api/ai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: systemPrompt, max_tokens: 160 }),
        });
        if (!resp.ok) {
          const txt = await resp.text();
          console.warn('AI proxy error', resp.status, txt);
          return;
        }
        const data = await resp.json();
        const reply = (data && (data.text || data.answer || data.message)) || (typeof data === 'string' ? data : JSON.stringify(data));
        if (reply) addMessage({ sender: 'bot', text: reply });
      } catch (e) {
        console.warn('AI fetch failed', e);
      }
    })();

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
        // send a result message with a linkable property id for clicking and include metadata
        addMessage({ sender: "bot", text: `${p.title} in ${p.location}, ${formatCurrency(p.price)}`, type: 'result', propertyId: p.id, title: p.title, image: p.image_url, location: p.location, price: p.price });
      });
    }, 800);
  };

  // --- Guided search helpers ---
  const guidedQuestions = (props) => [
    { key: 'location', text: 'Which location are you interested in?', suggestions: props.topLocations || [] },
    { key: 'type', text: 'Which property type do you prefer? (apartment / villa / studio / condo)', suggestions: ['apartment', 'villa', 'studio', 'condo'] },
    { key: 'minPrice', text: 'Minimum price (enter a number, leave blank for no minimum)' },
    { key: 'maxPrice', text: 'Maximum price (enter a number, leave blank for no maximum)' },
    { key: 'bedrooms', text: 'How many bedrooms? (enter number or "any")', suggestions: ['1', '2', '3', '4', 'any'] },
  ];

  const startGuided = (addMessage) => {
    setGuidedMode(true);
    setGuidedStep(0);
    setGuidedAnswers({});
    const tops = [...new Set(properties.map(p => (p.location || '').split(',')[0].trim()))].filter(Boolean).slice(0,6);
    const q = guidedQuestions({ topLocations: tops })[0];
    addMessage({ sender: 'bot', text: 'Great — let me ask a few quick questions to refine results.' });
    setTimeout(() => addMessage({ sender: 'bot', text: q.text, suggestions: q.suggestions }), 300);
  };

  const finishGuided = (addMessage, answers) => {
    // Parse numeric answers and compose a synthetic query string and search
    const parts = [];
    if (answers.location) parts.push(`in ${answers.location}`);
    if (answers.type) parts.push(answers.type);
    const parsedMin = parseNumberOrWord(answers.minPrice);
    const parsedMax = parseNumberOrWord(answers.maxPrice);
    if (parsedMin && Number(parsedMin) > 0) parts.push(`min ${parsedMin}`);
    if (parsedMax && Number(parsedMax) > 0) parts.push(`max ${parsedMax}`);
    const parsedBeds = parseNumberOrWord(answers.bedrooms);
    if (parsedBeds && parsedBeds !== 'any') parts.push(`${parsedBeds} bhk`);
    const query = parts.join(' ');
    const results = performPropertySearch(properties, query);
    if (results.length === 0) {
      addMessage({ sender: 'bot', text: 'Sorry, I could not find properties matching those filters.' });
      setGuidedMode(false);
      setGuidedStep(-1);
      return;
    }
  addMessage({ sender: 'bot', text: `Found ${results.length} properties. Showing top 5:` });
  results.slice(0,5).forEach(p => addMessage({ sender: 'bot', text: `${p.title} — ${p.location} — ${formatCurrency(p.price)}`, type: 'result', propertyId: p.id, title: p.title, image: p.image_url, location: p.location, price: p.price }));
    setGuidedMode(false);
    setGuidedStep(-1);
    setGuidedAnswers({});
  };

  const handleGuidedAnswer = (text, addMessage) => {
    const questions = guidedQuestions({ topLocations: [] });
    const step = guidedStep;
    if (step < 0 || step >= questions.length) {
      setGuidedMode(false);
      return;
    }
    const key = questions[step].key;
    const val = String(text).trim();
    setGuidedAnswers((prev) => ({ ...prev, [key]: val }));
    // Advance
    const next = step + 1;
    if (next < questions.length) {
      const nextQ = questions[next];
      setGuidedStep(next);
      setTimeout(() => addMessage({ sender: 'bot', text: nextQ.text, suggestions: nextQ.suggestions }), 300);
    } else {
      // finish
      finishGuided(addMessage, { ...guidedAnswers, [key]: val });
    }
  };

  // --- Lightweight AI-style responder (template + data-driven) ---
  const formatCurrency = (n) => {
    try {
      return `₹${Number(n).toLocaleString()}`;
    } catch {
      return `₹${n}`;
    }
  };

  const generateAIResponse = (text, addMessage) => {
    // Handle conversational messages first (greetings, questions about Ryna, etc.)
    const lowerText = text.toLowerCase().trim();
    
    // Greetings and casual conversation
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)$/i.test(lowerText)) {
      addMessage({ sender: 'bot', text: 'Hello! Great to meet you! I\'m here to help you find the perfect property. Are you looking to buy or rent? And do you have a specific location in mind?' });
      return true;
    }
    
    // Questions about Ryna/identity
    if (/who are you|what is your name|tell me about yourself|what can you do/i.test(lowerText)) {
      addMessage({ sender: 'bot', text: 'I\'m Ryna, your dedicated AI real estate assistant! I specialize in helping people find their ideal properties. I can search our database, provide market insights, answer pricing questions, and guide you step-by-step through your property search. How can I assist you today?' });
      return true;
    }
    
    // Thank you messages
    if (/thank you|thanks|appreciate|grateful/i.test(lowerText)) {
      addMessage({ sender: 'bot', text: 'You\'re very welcome! I\'m happy to help. Is there anything else about properties or real estate that I can assist you with?' });
      return true;
    }
    
    // General help requests
    if (/help|assist|support/i.test(lowerText) && !/find|search|property|house|apartment/i.test(lowerText)) {
      addMessage({ sender: 'bot', text: 'I\'d be happy to help! I can assist you with:\n• Finding properties based on your criteria\n• Providing price information and market insights\n• Answering questions about specific locations\n• Guiding you through a step-by-step search\n• Connecting you with our dealer at 📞 7982323147\n\nWhat would you like to explore?' });
      return true;
    }
    
    // Contact/phone number requests
    if (/contact|phone|call|number|dealer|agent/i.test(lowerText)) {
      addMessage({ sender: 'bot', text: 'You can contact our property dealer directly at:\n📞 **7982323147**\n\nThey\'re available 9 AM - 8 PM for property inquiries, site visits, and detailed discussions. You can also click the "📞 Call" button on any property card or in the property details modal!' });
      return true;
    }

    const filters = extractFilters(text);
    const results = performPropertySearch(properties, text);

    // Helper: stats for a set of properties
    const statsFor = (items) => {
      if (!items || items.length === 0) return null;
      const prices = items.filter(p => typeof p.price === 'number').map(p => p.price);
      if (prices.length === 0) return null;
      const sum = prices.reduce((s, v) => s + v, 0);
      const avg = Math.round(sum / prices.length);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return { avg, min, max, count: items.length };
    };

    // Detect price-statistics questions
    if (/average|mean|median|price range|price in|range of prices|what is the price/i.test(text)) {
      // Prefer scoped results (by location) if present
      let scopeItems = results;
      if (filters.location && (!results || results.length === 0)) {
        scopeItems = properties.filter(p => (p.location||'').toLowerCase().includes((filters.location||'').toLowerCase()));
      }
      const s = statsFor(scopeItems.length > 0 ? scopeItems : properties);
      if (!s) {
        addMessage({ sender: 'bot', text: 'I don\'t have price data for those specific criteria yet. Could you try a different location or let me show you our available listings?' });
        return true;
      }
      const locText = filters.location ? ` in ${filters.location}` : '';
      addMessage({ sender: 'bot', text: `Across ${s.count} listings${locText}, prices range from ${formatCurrency(s.min)} to ${formatCurrency(s.max)} with an average of ${formatCurrency(s.avg)}.` });
      // show top results if any
      if (results && results.length > 0) {
        addMessage({ sender: 'bot', text: `Here are the top ${Math.min(5, results.length)} listings I found:` });
        results.slice(0,5).forEach(p => addMessage({ sender: 'bot', text: `${p.title} — ${p.location} — ${formatCurrency(p.price)}`, type: 'result', propertyId: p.id, title: p.title, image: p.image_url, location: p.location, price: p.price }));
      }
      return true;
    }

    // If user asks a question about availability or recommendations
    if (/suggest|recommend|show me|find me|looking for|available|any listings|help me find/i.test(text)) {
      if (!results || results.length === 0) {
        addMessage({ sender: 'bot', text: 'I couldn\'t find properties matching those exact criteria. Let me help you by adjusting your search - could you tell me your preferred location and budget range?' });
        return true;
      }
      // Compose a short rationale explaining why top result is recommended
      const top = results[0];
      const reasonParts = [];
      if (filters.location && (top.location || '').toLowerCase().includes(filters.location.toLowerCase())) reasonParts.push('matches your location');
      if (filters.bedrooms && top.bedrooms === filters.bedrooms) reasonParts.push(`${filters.bedrooms} BHK`);
      if (filters.propertyType && (top.title || '').toLowerCase().includes(filters.propertyType)) reasonParts.push(filters.propertyType);
      if (filters.minPrice || filters.maxPrice) {
        reasonParts.push(`within your price range`);
      }
      const reason = reasonParts.length > 0 ? ` — ${reasonParts.join(', ')}` : '';
      addMessage({ sender: 'bot', text: `I recommend: ${top.title} in ${top.location}, priced ${formatCurrency(top.price)}${reason}.` });
      addMessage({ sender: 'bot', text: `I found ${results.length} matching properties. Showing top ${Math.min(5, results.length)}:` });
  results.slice(0,5).forEach(p => addMessage({ sender: 'bot', text: `${p.title} — ${p.location} — ${formatCurrency(p.price)}`, type: 'result', propertyId: p.id, title: p.title, image: p.image_url, location: p.location, price: p.price }));
      return true;
    }

    // Generic fallback: only show properties if the text contains actual property-related keywords
    const hasPropertyIntent = /property|properties|house|home|apartment|flat|bhk|bedroom|buy|rent|sale|listing|real estate|condo|villa|townhouse|studio/i.test(text);
    
    if (hasPropertyIntent && results && results.length > 0) {
      addMessage({ sender: 'bot', text: `I found ${results.length} properties that seem relevant. Top picks:` });
      results.slice(0,5).forEach(p => addMessage({ sender: 'bot', text: `${p.title} — ${p.location} — ${formatCurrency(p.price)}`, type: 'result', propertyId: p.id, title: p.title, image: p.image_url, location: p.location, price: p.price }));
      return true;
    }

    // If no property intent detected, provide helpful guidance
    if (!hasPropertyIntent) {
      addMessage({ sender: 'bot', text: 'I\'m here to help you with real estate! You can ask me things like:\n• "Show me 2 BHK apartments in Mumbai"\n• "What\'s the average price in New York?"\n• "I\'m looking for a house under ₹50 lakhs"\n• Or just click "Guided" for step-by-step assistance!\n\nWhat type of property are you interested in?' });
      return true;
    }

    // If nothing matched, return false so caller can run fallback flows
    return false;
  };

  // Normal UI search
  const filteredProperties = properties.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = q === '' || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || String(p.price).includes(q);

    // Filters: location
    if (filterLocation && filterLocation !== 'Any') {
      const loc0 = (p.location || '').split(',')[0].trim().toLowerCase();
      if (!loc0.includes(filterLocation.toLowerCase())) return false;
    }

    // Type
    if (filterType && filterType !== 'Any') {
      const title = (p.title || '').toLowerCase();
      if (!title.includes(filterType.toLowerCase())) return false;
    }

    // Price
    if (filterMinPrice && Number(filterMinPrice) > 0) {
      if (typeof p.price === 'number' && p.price < Number(filterMinPrice)) return false;
    }
    if (filterMaxPrice && Number(filterMaxPrice) > 0) {
      if (typeof p.price === 'number' && p.price > Number(filterMaxPrice)) return false;
    }

    return matchesSearch;
  });
  const favoriteProps = properties.filter((p) =>
    favorites.includes(String(p.id))
  );

  const [showChat, setShowChat] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  return (
    <div className="app-root">
      {/* ChatPanel is rendered as a floating panel via the toggle button below */}

  <main className="content">
        {/* Header with logo and centered headings */}
  <header className="app-header">
          <img
            src="/logo.jpeg"
            alt="Real Estate Chatbot"
            className="logo"
            style={{ height: 72, width: 72 }}
            onError={(e) => { e.target.onerror = null; e.target.src = '/vite.svg'; e.target.style.filter = 'grayscale(1)'; }}
          />
          <h1 className="app-title">Find Your Dream Home</h1>
          <p className="app-subtitle">Search properties naturally — ask the chatbot.</p>
        </header>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "10px" }}>
          Property Listings
        </h1>

        <input
          className="search-input"
          type="text"
          placeholder="Search by name, location, or price"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: "30px" }}
        />

        {/* Filters row */}
  <div className="filters-row">
          {/* Location select (generated from loaded properties) */}
          <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8 }}>
            <option>Any</option>
            {[...new Set(properties.map(p => (p.location || '').split(',')[0].trim()))].filter(Boolean).map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Type select (common types) */}
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8 }}>
            <option>Any</option>
            <option>apartment</option>
            <option>villa</option>
            <option>studio</option>
            <option>condo</option>
          </select>

          {/* Price range inputs */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="number" placeholder="Min price" value={filterMinPrice || ''} onChange={e => setFilterMinPrice(Number(e.target.value) || 0)} style={{ padding: '8px', borderRadius: 8, width: 120 }} />
            <span style={{ color: '#ccc' }}>—</span>
            <input type="number" placeholder="Max price" value={filterMaxPrice || ''} onChange={e => setFilterMaxPrice(Number(e.target.value) || 0)} style={{ padding: '8px', borderRadius: 8, width: 120 }} />
          </div>

          <button onClick={() => { setFilterLocation('Any'); setFilterType('Any'); setFilterMinPrice(0); setFilterMaxPrice(0); }} style={{ marginLeft: 8, padding: '8px 12px', borderRadius: 8 }}>Clear</button>
        </div>

  <h2>Saved Favorites</h2>
  <div className="favorites-grid">
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
                <div className="card-body">
                  <h3 className="card-title">{p.title}</h3>
                  <p className="card-location">{p.location}</p>
                  <p className="card-price">{formatCurrency(p.price)}</p>
                  <button onClick={() => removeFavorite(p.id)} className="action-btn remove-btn">Remove from Favorites</button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#888" }}>No favorites saved yet.</p>
          )}
        </div>

        <div className="property-grid">
          {filteredProperties.map((p) => (
            <div id={`property-${p.id}`} key={p.id} className="property-card" style={{ boxShadow: highlighted === String(p.id) || highlighted === p.id ? "0 0 0 3px #66b2ff66" : undefined }}>
              <div className="property-card-clickable" onClick={() => handlePropertyClick(p)}>
                <img className="property-image" src={p.image_url} alt={p.title} />
                <div className="card-body">
                  <h2 className="card-title">{p.title}</h2>
                  <p className="card-location">Location: {p.location}</p>
                  <p className="card-price">{formatCurrency(p.price)}</p>
                  <div className="click-hint">Click for details</div>
                </div>
              </div>
              <div className="card-actions">
                <button onClick={(e) => { e.stopPropagation(); saveFavorite(p.id); }} disabled={favorites.includes(String(p.id))} className={`action-btn ${favorites.includes(String(p.id)) ? '' : 'save-btn'}`}>
                  {favorites.includes(String(p.id)) ? '✓ Favorited' : '♥ Save to Favorites'}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); window.open('tel:7982323147', '_self'); }} 
                  className="action-btn contact-btn"
                  title="Call dealer at 7982323147"
                >
                  📞 Call
                </button>
              </div>
            </div>
          ))}
        </div>
        </main>

      {/* Property Details Modal */}
      <PropertyModal 
        property={selectedProperty} 
        isOpen={showPropertyModal} 
        onClose={closePropertyModal}
        onSaveFavorite={saveFavorite}
        favorites={favorites}
      />

      {/* Floating chat button + panel */}
  <div className="floating-controls">
        {/* Panel container (slides up when open) */}
        <div aria-hidden={!showChat} style={{ transform: showChat ? 'translateY(0) scale(1)' : 'translateY(10px) scale(.98)', opacity: showChat ? 1 : 0, pointerEvents: showChat ? 'auto' : 'none', transition: 'transform 240ms cubic-bezier(.2,.9,.3,1), opacity 200ms ease' }}>
          <div className="chat-panel-root">
            <ChatPanel onUserMessage={(t, a) => { handleChatInput(t, a); }} onResultClick={scrollToProperty} onClose={() => setShowChat(false)} onReady={(addMessage) => { setChatAddMessage(() => addMessage); }} />
          </div>
        </div>

        {/* Floating toggle button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <button className="chat-toggle" onClick={() => setShowChat((s) => !s)} aria-label="Open chat" style={{ transform: showChat ? 'scale(0.92) rotate(-6deg)' : 'scale(1)' }}>
          {/* Simple chat icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" />
          </svg>
          </button>
          <button className="chat-guided-btn" onClick={() => { if (chatAddMessage) startGuided(chatAddMessage); else { setShowChat(true); setTimeout(() => { if (chatAddMessage) startGuided(chatAddMessage); else alert('Open the chat panel first so I can ask a few questions.'); }, 350); } }}>Guided</button>
        </div>
      </div>
    </div>
  );
}

export default App;

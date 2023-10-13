import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import SearchBar from "./components/SearchBar/SearchBar";
import ProductCard from "./components/ProductCard/ProductCard";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([
    {
      name: "New Shoe",
      price: 55,
      src: "https://media.aldoshoes.com/v3/product/torino/001-001-043/torino_black_001-001-043_main_sq_gy_800x800.jpg",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleKeyUp = (e) => {
    if (e.key === "Enter" && searchTerm) {
      // Make the API call
      setLoading(true);
      fetch(`http://localhost:5000/aisearch?q=${searchTerm}`)
        .then((response) => response.json())
        .then((data) => {
            console.log('data --- ', data)
          setResults(data.matching_shoes.slice(0, 10));
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
          setLoading(false);
        });
    }
  };

  return (
    <div className="App">
      <Navbar />
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleKeyUp={handleKeyUp}
      />
      <div style={{ padding: "0 72px" }}>
        <div className="search-results">
          {loading ? (
            <p>Loading...</p>
          ) : (
            results.map((item, index) => (
              <div key={index} className="image-container">
                <ProductCard
                  name={item.name}
                  price={item.price}
                  imgSrc={item.image_url}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

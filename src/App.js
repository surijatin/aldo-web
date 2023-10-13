import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import SearchBar from "./components/SearchBar/SearchBar";
import ProductCard from "./components/ProductCard/ProductCard";
import ImgUpload from "./components/ImgUpload/ImgUpload";
import { isEmpty } from "lodash";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const handleKeyUp = (e) => {
    if (e.key === "Enter" && searchTerm) {
      // Make the API call
      setLoading(true);
      fetch(`http://localhost:5000/aisearch?q=${searchTerm}`)
        .then((response) => response.json())
        .then((data) => {
          setResults(data.matching_shoes.slice(0, 10));
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
          setLoading(false);
        });
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    handleSubmit(event);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/similar_images", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log(data);
      setResults(data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="App">
      <Navbar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 72px",
        }}
      >
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleKeyUp={handleKeyUp}
          // style={{ width: "80%" }} // added inline style here
        />
        <ImgUpload handleFileChange={handleFileChange} />
      </div>
      <div style={{ padding: "0 72px" }}>
        <div className="search-results">
          {loading ? (
            <p>Loading...</p>
          ) : isEmpty(results) ? (
            <div>No search results</div>
          ) : (
            results.map((item, index) => (
              <div key={index} className="image-container">
                <ProductCard
                  name={item.name || ""}
                  price={item.price ? `${item.price}$` : ""}
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

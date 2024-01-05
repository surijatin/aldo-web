import React from "react";
import "./SearchBar.css";

function SearchBar({ searchTerm, setSearchTerm, handleKeyUp }) {
  return (
    <>
      <div className="search-bar" style={{ flex: "0.8", marginRight: "16px" }}>
        {" "}
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyUp={handleKeyUp}
          style={{ width: "100%" }}
        />
      </div>
    </>
  );
}

export default SearchBar;

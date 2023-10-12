import React from "react";
import "./SearchBar.css";

function SearchBar({ searchTerm, setSearchTerm, handleKeyUp }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyUp={handleKeyUp}
      />
    </div>
  );
}

export default SearchBar;

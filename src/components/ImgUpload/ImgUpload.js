import React from "react";
import { FaCamera } from "react-icons/fa";

function ImgUpload({ handleFileChange }) {
  return (
    <>
      <div style={{ paddingLeft: "20px" }}>
        {" "}
        {/* added padding-left here */}
        <label
          htmlFor="fileUpload"
          style={{ cursor: "pointer", fontSize: "40px" }}
        >
          <FaCamera /> {/* Using the Camera icon */}
        </label>
        <input
          id="fileUpload"
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>
    </>
  );
}

export default ImgUpload;

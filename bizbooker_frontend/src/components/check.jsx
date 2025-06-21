

import React, { useEffect, useState } from "react";
import axios from "axios";

const ImageFromBackend = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("http://localhost:8081/image", {
          responseType: "blob", // Ensures binary data
        });

        const imageUrl = URL.createObjectURL(response.data);
        setImageSrc(imageUrl);
      } catch (err) {
        setError("Failed to load image");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, []);

  if (loading) return <div>Loading image...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Loaded from backend"
          style={{
            maxWidth: "300px",
            maxHeight: "300px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />
      ) : (
        <div>No image available</div>
      )}
    </div>
  );
};

export default ImageFromBackend;


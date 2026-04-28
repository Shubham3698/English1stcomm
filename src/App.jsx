import React, { useState, useEffect } from "react";

export default function App() {
  const posts = [
    {
      word: "Gratitude",
      meaning: "कृतज्ञता",
      image: "https://i.pinimg.com/736x/01/c6/13/01c61342e1caa249d41d0ccfa2f9ac7f.jpg",
    },
    {
      word: "Courage",
      meaning: "साहस",
      image: "https://i.pinimg.com/736x/28/cb/d5/28cbd5dc8d50c7311cd67f53104cf275.jpg",
    },
    {
      word: "Peace",
      meaning: "शांति",
      image: "https://i.pinimg.com/736x/cb/06/9e/cb069e70b3e556abd90693efb343c87f.jpg",
    },
    {
      word: "Success",
      meaning: "सफलता",
      image: "https://i.pinimg.com/736x/cb/06/9e/cb069e70b3e556abd90693efb343c87f.jpg",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  // 🔒 Block inspect shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (
        e.ctrlKey &&
        (e.key === "u" || e.key === "U" || e.key === "i" || e.key === "I")
      ) {
        e.preventDefault();
      }
      if (e.key === "F12") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f1f2f6",
        minHeight: "100vh",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          background: "#ff3b3b",
          color: "white",
          padding: "15px",
          textAlign: "center",
          fontSize: "20px",
          fontWeight: "bold",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        English Community
      </nav>

      {/* Posts */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "380px" }}>
          {posts.map((post, index) => (
            <div
              key={index}
              onClick={() =>
                setActiveIndex(activeIndex === index ? null : index)
              }
              style={{
                background: "white",
                marginBottom: "25px",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                cursor: "pointer",
              }}
            >
              {/* Image with tap effect */}
              <div style={{ position: "relative" }}>
                <img
                  src={post.image}
                  alt={post.word}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "280px",
                    objectFit: "cover",
                    filter:
                      activeIndex === index
                        ? "brightness(100%)"
                        : "brightness(60%)",
                    transition: "0.4s ease",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Text Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0 }}>{post.word}</h3>
                <span>{post.meaning}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

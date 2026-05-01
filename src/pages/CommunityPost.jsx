import React, { useState, useEffect } from "react";
import staticPosts from "../data/posts";

export default function CommunityPost() {
  const [dbPosts, setDbPosts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  useEffect(() => {
    fetch(`${API_URL}/api/english-posts/all`)
      .then(res => res.json())
      .then(data => setDbPosts(data))
      .catch(err => console.log(err));
  }, []);

  const allPosts = [...dbPosts, ...staticPosts];

  return (
    <div className="flex justify-center p-5 bg-gray-50 min-h-screen">
      <div className="w-full max-w-sm">
        {allPosts.map((post, index) => (
          <div key={index} onClick={() => setActiveIndex(activeIndex === index ? null : index)} className="bg-white mb-8 rounded-[2.5rem] overflow-hidden shadow-sm border cursor-pointer">
            <img src={post.image} className={`w-full h-80 object-cover transition ${activeIndex === index ? "brightness-110" : "brightness-90"}`} />
            <div className="flex justify-between items-center px-6 py-5">
              <h3 className="font-black text-xl uppercase tracking-tighter">{post.word}</h3>
              <span className="text-red-500 font-black bg-red-50 px-4 py-2 rounded-2xl text-sm italic">{post.meaning}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
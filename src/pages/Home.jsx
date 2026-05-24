import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function VocabPage() {

const [word, setWord] = useState("");
const [meaning, setMeaning] = useState("");
const [sentences, setSentences] = useState("");
const [partOfSpeech, setPartOfSpeech] = useState("");
const [explanation, setExplanation] = useState("");
const [synonyms, setSynonyms] = useState("");
const [antonyms, setAntonyms] = useState("");

const [activeWord, setActiveWord] = useState("");
const [loading, setLoading] = useState(false);
const [history, setHistory] = useState([]);
const [showHistory, setShowHistory] = useState(false);

const USER_ID = "dameeto_user_shubham_123";

const API_URL =
window.location.hostname === "localhost"
? "http://localhost:3000"
: "https://serdeptry1st.onrender.com";

const handlePronounce = (textToSpeak) => {

if (!textToSpeak) return;

window.speechSynthesis.cancel();

const utterance = new SpeechSynthesisUtterance(textToSpeak);

utterance.lang = "en-US";
utterance.pitch = 1;
utterance.rate = 0.85;

window.speechSynthesis.speak(utterance);

};

const fetchHistoryFromDB = async () => {

try {

const response = await fetch(
`${API_URL}/api/words/history/${USER_ID}`
);

const resData = await response.json();

if (response.ok && resData.success) {
setHistory(resData.data);
}

} catch (err) {
console.error("History fetch error:", err);
}

};

useEffect(() => {
fetchHistoryFromDB();
}, []);

const handleSearchWord = async () => {

if (!word || !word.trim()) {

toast.error("Pehle word likho ✍️");

return;

}

setLoading(true);
setShowHistory(false);

try {

const response = await fetch(`${API_URL}/api/words/define`, {

method: "POST",

headers: {
"Content-Type": "application/json",
},

body: JSON.stringify({
word: word.trim(),
userId: USER_ID,
}),

});

const resData = await response.json();

if (response.ok && resData.success) {

setActiveWord(resData.data.word);

setPartOfSpeech(resData.data.partOfSpeech);

setMeaning(resData.data.meaning);

setExplanation(resData.data.explanation);

setSynonyms(resData.data.synonyms);

setAntonyms(resData.data.antonyms);

setSentences(resData.data.sentences);

toast.success("Word analyzed 🚀");

handlePronounce(resData.data.word);

setWord("");

fetchHistoryFromDB();

} else {

toast.error(
resData.message || "Server ne data push nahi kiya!"
);

}

} catch (err) {

console.error("Fetch error:", err);

toast.error("Backend connect nahi ho raha!");

} finally {

setLoading(false);

}

};

const loadFromHistoryCard = (item) => {

setActiveWord(item.word);

setPartOfSpeech(item.partOfSpeech || "Vocabulary");

setMeaning(item.meaning);

setExplanation(item.explanation);

setSynonyms(item.synonyms);

setAntonyms(item.antonyms);

setSentences(item.sentences);

setShowHistory(false);

handlePronounce(item.word);

};

return (

<div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col items-center p-4 py-10">

<Toaster position="top-center" />

<div className="w-full max-w-xl flex justify-between items-center mb-4">

<button
onClick={() => setShowHistory(!showHistory)}
className="bg-[#0b0b0e] border border-white/10 px-4 py-2 rounded-xl text-[11px] font-black"
>
History ({history.length})
</button>

<span className="text-[9px] uppercase text-slate-500">
Cloud Live
</span>

</div>

<div className="w-full max-w-xl bg-[#0b0b0e] border border-white/[0.05] rounded-[2rem] p-5 space-y-5">

{showHistory && (

<div className="grid grid-cols-2 gap-2">

{history.map((item) => (

<button
key={item._id}
onClick={() => loadFromHistoryCard(item)}
className="bg-black/40 border border-white/[0.05] rounded-xl p-3 text-left"
>

<div className="text-cyan-400 text-[11px] uppercase font-black truncate">
{item.word}
</div>

<div className="text-[9px] text-slate-500 truncate">
{item.meaning}
</div>

</button>

))}

</div>

)}

<div className="text-center space-y-1">

<h2 className="text-3xl font-black italic uppercase bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
🤖 Dameeto Vocab Node
</h2>

<p className="text-[10px] text-slate-500 uppercase">
AI Powered Vocabulary
</p>

</div>

<div className="flex flex-col sm:flex-row gap-3">

<input
type="text"
placeholder="TYPE ANY WORD..."
value={word}
onChange={(e) => setWord(e.target.value)}
onKeyDown={(e) =>
e.key === "Enter" && handleSearchWord()
}
className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none text-white"
/>

<button
onClick={handleSearchWord}
disabled={loading}
className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-7 py-4 rounded-2xl text-[11px] font-black uppercase"
>

{loading ? "Analyzing..." : "⚡ Analyze"}

</button>

</div>

{activeWord && (

<div className="bg-black/40 border border-white/[0.05] rounded-[2rem] p-5 space-y-5">

<div className="flex items-center justify-between gap-3 flex-wrap">

<div>

<h3 className="text-3xl font-black italic uppercase text-cyan-400">
{activeWord}
</h3>

<div className="mt-2">
<span className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] text-indigo-300 font-black uppercase">
{partOfSpeech}
</span>
</div>

</div>

<button
onClick={() => handlePronounce(activeWord)}
className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-cyan-400 text-sm font-bold"
>
🔊 Pronounce
</button>

</div>

<div className="bg-emerald-500/[0.04] border border-emerald-500/20 rounded-2xl p-4">

<div className="text-[10px] uppercase font-black text-emerald-400 mb-2">
Hindi Meaning
</div>

<div className="text-emerald-200 text-lg font-bold">
{meaning}
</div>

</div>

<div className="bg-yellow-500/[0.04] border border-yellow-500/20 rounded-2xl p-4 space-y-4">

<div>

<div className="text-[10px] uppercase font-black text-yellow-400 mb-2">
Usage Explanation
</div>

<p className="text-yellow-100 text-[13px] leading-relaxed">
{explanation}
</p>

</div>

<div>

<div className="text-[10px] uppercase font-black text-cyan-400 mb-2">
Practical Examples
</div>

<div className="text-slate-300 text-[13px] whitespace-pre-line leading-relaxed">
{sentences}
</div>

</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

<div className="bg-indigo-500/[0.05] border border-indigo-500/20 rounded-xl p-4">

<div className="text-[10px] uppercase font-black text-indigo-400 mb-2">
✨ Similar Words
</div>

<div className="text-indigo-200 text-[13px] font-semibold leading-relaxed">
{synonyms}
</div>

</div>

<div className="bg-rose-500/[0.05] border border-rose-500/20 rounded-xl p-4">

<div className="text-[10px] uppercase font-black text-rose-400 mb-2">
⚡ Opposite Words
</div>

<div className="text-rose-200 text-[13px] font-semibold leading-relaxed">
{antonyms}
</div>

</div>

</div>

</div>

</div>

)}

</div>

</div>

);

}
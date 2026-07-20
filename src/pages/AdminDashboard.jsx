import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [category, setCategory] = useState('grammar');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterSubtitle, setChapterSubtitle] = useState('');

  // 🔴 Lessons ek Array hai (Ek chapter me multiple topics daalne ke liye)
  const [lessons, setLessons] = useState([
    {
      lessonTitle: '', videoId: '', duration: '10 Mins',
      speakingHindi: '', speakingEnglish: '',
      videoQuizzes: [], standaloneQuizzes: []
    }
  ]);

  // 🔥 DYNAMIC API URL (Bina kisi .env file ke, 100% kaam karega)
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_BASE_URL = isLocalhost ? 'http://localhost:3000' : 'https://serdeptry1st.onrender.com';

  // -- Add New Topic (Lesson) --
  const addLesson = () => {
    setLessons([...lessons, {
      lessonTitle: '', videoId: '', duration: '10 Mins',
      speakingHindi: '', speakingEnglish: '',
      videoQuizzes: [], standaloneQuizzes: []
    }]);
  };

  // -- Update Topic (Lesson) Fields --
  const updateLesson = (index, field, value) => {
    const updatedLessons = [...lessons];
    updatedLessons[index][field] = value;
    setLessons(updatedLessons);
  };

  // -- Add/Update Quizzes inside a specific Lesson --
  const addVideoQuiz = (lessonIndex) => {
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex].videoQuizzes.push({ time: '', question: '', options: '', correct: 0 });
    setLessons(updatedLessons);
  };

  const updateVideoQuiz = (lessonIndex, quizIndex, field, value) => {
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex].videoQuizzes[quizIndex][field] = value;
    setLessons(updatedLessons);
  };

  const addStandaloneQuiz = (lessonIndex) => {
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex].standaloneQuizzes.push({ q: '', o: '', c: 0 });
    setLessons(updatedLessons);
  };

  const updateStandaloneQuiz = (lessonIndex, quizIndex, field, value) => {
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex].standaloneQuizzes[quizIndex][field] = value;
    setLessons(updatedLessons);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format everything for backend
    const formattedLessons = lessons.map(l => ({
      title: l.lessonTitle,
      duration: l.duration,
      videoId: l.videoId,
      speakingData: { hindi: l.speakingHindi, english: l.speakingEnglish },
      videoQuizzes: l.videoQuizzes.map(vq => ({
        time: Number(vq.time),
        question: vq.question,
        options: vq.options.split(',').map(s => s.trim()),
        correct: Number(vq.correct)
      })),
      standaloneQuiz: l.standaloneQuizzes.map(sq => ({
        q: sq.q, 
        o: sq.o.split(',').map(s => s.trim()), 
        c: Number(sq.c)
      }))
    }));

    const payload = {
      category, 
      title: chapterTitle, 
      subtitle: chapterSubtitle,
      lessons: formattedLessons
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/add-chapter`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success("Full Chapter & All Topics Published! 🚀");
        setChapterTitle(''); setChapterSubtitle('');
        setLessons([{ lessonTitle: '', videoId: '', duration: '10 Mins', speakingHindi: '', speakingEnglish: '', videoQuizzes: [], standaloneQuizzes: [] }]);
      } else {
        toast.error("Error from server. Please try again.");
      }
    } catch (err) { 
      toast.error("Failed to connect to the database."); 
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-black mb-6 text-[#8B004A] text-center md:text-left">Dameeto Super Admin</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 📚 CHAPTER SETUP */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-300 shadow-sm border-l-8 border-l-[#8B004A]">
          <h2 className="font-black text-lg md:text-xl mb-4 text-gray-800">1. Create Chapter (e.g., Basic Grammar)</h2>
          {/* Mobile pe grid-cols-1, PC pe grid-cols-3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select className="border-2 p-3 rounded-lg font-bold w-full" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="grammar">Grammar Book</option>
              <option value="realLife">Real-Life Talk</option>
            </select>
            <input type="text" placeholder="Chapter Title" value={chapterTitle} className="border-2 p-3 rounded-lg font-bold w-full" onChange={e => setChapterTitle(e.target.value)} required />
            <input type="text" placeholder="Chapter Subtitle" value={chapterSubtitle} className="border-2 p-3 rounded-lg font-bold w-full" onChange={e => setChapterSubtitle(e.target.value)} />
          </div>
        </div>

        {/* 📄 TOPICS (LESSONS) SETUP */}
        {lessons.map((lesson, lIndex) => (
          <div key={lIndex} className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-black text-lg md:text-xl text-[#E01A76]">Topic {lIndex + 1}</h2>
            </div>
            
            {/* Mobile pe grid-cols-1, PC pe grid-cols-2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Topic Name (e.g. Noun)" value={lesson.lessonTitle} className="border-2 p-3 rounded-lg bg-gray-50 w-full" onChange={e => updateLesson(lIndex, 'lessonTitle', e.target.value)} required />
              <input type="text" placeholder="Video ID (e.g. fFMcolWgD3w)" value={lesson.videoId} className="border-2 p-3 rounded-lg bg-gray-50 w-full" onChange={e => updateLesson(lIndex, 'videoId', e.target.value)} />
            </div>

            {/* LIVE VIDEO QUIZZES */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
              <h3 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wide">Live Video Popups</h3>
              {lesson.videoQuizzes.map((vq, vqIndex) => (
                // Mobile pe column me stack hoga, PC pe row me
                <div key={vqIndex} className="flex flex-col md:flex-row gap-2 mb-4 md:mb-2 bg-white md:bg-transparent p-3 md:p-0 rounded-lg border md:border-none border-blue-200 shadow-sm md:shadow-none">
                  <input type="number" placeholder="Sec (e.g. 15)" value={vq.time} className="border p-2 w-full md:w-24 rounded" onChange={e => updateVideoQuiz(lIndex, vqIndex, 'time', e.target.value)} />
                  <input type="text" placeholder="Question" value={vq.question} className="border p-2 w-full md:flex-1 rounded" onChange={e => updateVideoQuiz(lIndex, vqIndex, 'question', e.target.value)} />
                  <input type="text" placeholder="A, B, C, D" value={vq.options} className="border p-2 w-full md:flex-1 rounded" onChange={e => updateVideoQuiz(lIndex, vqIndex, 'options', e.target.value)} />
                  <input type="number" placeholder="Ans(0-3)" value={vq.correct} className="border p-2 w-full md:w-24 rounded" onChange={e => updateVideoQuiz(lIndex, vqIndex, 'correct', e.target.value)} />
                </div>
              ))}
              <button type="button" onClick={() => addVideoQuiz(lIndex)} className="text-blue-600 font-bold text-sm mt-1">+ Add Popup to Video</button>
            </div>

            {/* QUICK TESTS */}
            <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 mb-4">
              <h3 className="font-bold text-pink-800 mb-3 text-sm uppercase tracking-wide">Quick Test Questions</h3>
              {lesson.standaloneQuizzes.map((sq, sqIndex) => (
                <div key={sqIndex} className="flex flex-col md:flex-row gap-2 mb-4 md:mb-2 bg-white md:bg-transparent p-3 md:p-0 rounded-lg border md:border-none border-pink-200 shadow-sm md:shadow-none">
                  <input type="text" placeholder="Question" value={sq.q} className="border p-2 w-full md:flex-1 rounded" onChange={e => updateStandaloneQuiz(lIndex, sqIndex, 'q', e.target.value)} />
                  <input type="text" placeholder="A, B, C, D" value={sq.o} className="border p-2 w-full md:flex-1 rounded" onChange={e => updateStandaloneQuiz(lIndex, sqIndex, 'o', e.target.value)} />
                  <input type="number" placeholder="Ans(0-3)" value={sq.c} className="border p-2 w-full md:w-24 rounded" onChange={e => updateStandaloneQuiz(lIndex, sqIndex, 'c', e.target.value)} />
                </div>
              ))}
              <button type="button" onClick={() => addStandaloneQuiz(lIndex)} className="text-pink-600 font-bold text-sm mt-1">+ Add MCQ Question</button>
            </div>

            {/* VOICE PRACTICE */}
            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
              <h3 className="font-bold text-green-800 mb-3 text-sm uppercase tracking-wide">Voice Practice</h3>
              <div className="flex flex-col md:flex-row gap-2">
                <input type="text" placeholder="Hindi Sentence" value={lesson.speakingHindi} className="border p-2 w-full md:flex-1 rounded" onChange={e => updateLesson(lIndex, 'speakingHindi', e.target.value)} />
                <input type="text" placeholder="English Target" value={lesson.speakingEnglish} className="border p-2 w-full md:flex-1 rounded" onChange={e => updateLesson(lIndex, 'speakingEnglish', e.target.value)} />
              </div>
            </div>

          </div>
        ))}

        {/* ADD NEW TOPIC BUTTON */}
        <button type="button" onClick={addLesson} className="w-full bg-gray-200 text-gray-700 border-2 border-dashed border-gray-400 p-4 rounded-xl font-black text-sm md:text-lg hover:bg-gray-300 transition-all">
          ➕ Add Another Topic (Lesson) to this Chapter
        </button>

        <button type="submit" className="w-full bg-[#8B004A] text-white p-4 md:p-5 rounded-xl font-black text-lg md:text-xl hover:bg-[#6a0038] shadow-xl">
          🚀 Publish Complete Module to Live App
        </button>
      </form>
    </div>
  );
}
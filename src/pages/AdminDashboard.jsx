import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Edit2, Trash2, PlusCircle, List, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [viewMode, setViewMode] = useState('add'); // 'add' or 'manage'
  const [existingChapters, setExistingChapters] = useState([]);
  const [editingId, setEditingId] = useState(null); // Track if updating

  const [category, setCategory] = useState('grammar');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterSubtitle, setChapterSubtitle] = useState('');

  const [lessons, setLessons] = useState([
    { lessonTitle: '', videoId: '', duration: '10 Mins', speakingHindi: '', speakingEnglish: '', videoQuizzes: [], standaloneQuizzes: [] }
  ]);

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_BASE_URL = isLocalhost ? 'http://localhost:3000' : 'https://serdeptry1st.onrender.com';

  // 🔥 Fetch All Chapters for Management
  const fetchChapters = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/syllabus`);
      const data = await res.json();
      // Combine grammar and realLife for admin list
      const combined = [...(data.grammar || []), ...(data.realLife || [])];
      setExistingChapters(combined);
    } catch (err) {
      toast.error("Failed to fetch chapters.");
    }
  };

  useEffect(() => {
    if (viewMode === 'manage') {
      fetchChapters();
    }
  }, [viewMode]);

  // -- Dynamic Lesson Handlers --
  const addLesson = () => setLessons([...lessons, { lessonTitle: '', videoId: '', duration: '10 Mins', speakingHindi: '', speakingEnglish: '', videoQuizzes: [], standaloneQuizzes: [] }]);
  const updateLesson = (index, field, value) => { const ul = [...lessons]; ul[index][field] = value; setLessons(ul); };
  const addVideoQuiz = (lIndex) => { const ul = [...lessons]; ul[lIndex].videoQuizzes.push({ time: '', question: '', options: '', correct: 0 }); setLessons(ul); };
  const updateVideoQuiz = (lIndex, qIndex, field, value) => { const ul = [...lessons]; ul[lIndex].videoQuizzes[qIndex][field] = value; setLessons(ul); };
  const addStandaloneQuiz = (lIndex) => { const ul = [...lessons]; ul[lIndex].standaloneQuizzes.push({ q: '', o: '', c: 0 }); setLessons(ul); };
  const updateStandaloneQuiz = (lIndex, qIndex, field, value) => { const ul = [...lessons]; ul[lIndex].standaloneQuizzes[qIndex][field] = value; setLessons(ul); };

  const deleteLessonBox = (index) => {
    const ul = [...lessons];
    ul.splice(index, 1);
    setLessons(ul);
  };

  // 🔥 LOAD DATA FOR EDITING
  const loadChapterForEdit = (chapter) => {
    setEditingId(chapter._id);
    setCategory(chapter.category);
    setChapterTitle(chapter.title);
    setChapterSubtitle(chapter.subtitle);

    // Backend format ko wapas Form format me convert karna
    const formattedLessons = chapter.lessons.map(l => ({
      lessonTitle: l.title,
      videoId: l.videoId || '',
      duration: l.duration || '10 Mins',
      speakingHindi: l.speakingData?.hindi || '',
      speakingEnglish: l.speakingData?.english || '',
      videoQuizzes: (l.videoQuizzes || []).map(vq => ({ ...vq, options: vq.options.join(', ') })),
      standaloneQuizzes: (l.standaloneQuiz || []).map(sq => ({ q: sq.q, o: sq.o.join(', '), c: sq.c }))
    }));

    setLessons(formattedLessons.length > 0 ? formattedLessons : [{ lessonTitle: '', videoId: '', duration: '10 Mins', speakingHindi: '', speakingEnglish: '', videoQuizzes: [], standaloneQuizzes: [] }]);
    setViewMode('add');
    toast("Loaded for Editing!", { icon: "📝" });
  };

  // 🔥 DELETE CHAPTER
  const deleteChapter = async (id) => {
    if(!window.confirm("Are you sure you want to delete this entire chapter?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/delete-chapter/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Chapter Deleted!");
        fetchChapters();
      }
    } catch (err) { toast.error("Delete failed."); }
  };

  const resetForm = () => {
    setEditingId(null);
    setChapterTitle(''); setChapterSubtitle('');
    setLessons([{ lessonTitle: '', videoId: '', duration: '10 Mins', speakingHindi: '', speakingEnglish: '', videoQuizzes: [], standaloneQuizzes: [] }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formattedLessons = lessons.map(l => ({
      title: l.lessonTitle, duration: l.duration, videoId: l.videoId,
      speakingData: { hindi: l.speakingHindi, english: l.speakingEnglish },
      videoQuizzes: l.videoQuizzes.map(vq => ({
        time: Number(vq.time), question: vq.question,
        options: vq.options.split(',').map(s => s.trim()), correct: Number(vq.correct)
      })),
      standaloneQuiz: l.standaloneQuizzes.map(sq => ({
        q: sq.q, o: sq.o.split(',').map(s => s.trim()), c: Number(sq.c)
      }))
    }));

    const payload = { category, title: chapterTitle, subtitle: chapterSubtitle, lessons: formattedLessons };

    try {
      // Check if we are updating existing or adding new
      const url = editingId ? `${API_BASE_URL}/api/update-chapter/${editingId}` : `${API_BASE_URL}/api/add-chapter`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success(editingId ? "Chapter Updated Successfully! 🚀" : "Chapter Created Successfully! 🚀");
        resetForm();
        setViewMode('manage'); // Save hote hi wapas list pe bhej do
      } else {
        toast.error("Error from server.");
      }
    } catch (err) { toast.error("Failed to connect."); }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-[#8B004A]">Dameeto Control Center</h1>
        
        {/* Toggle View Buttons */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full md:w-auto">
          <button 
            onClick={() => { setViewMode('add'); resetForm(); }}
            className={`flex-1 md:px-6 py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${viewMode === 'add' ? 'bg-[#8B004A] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <PlusCircle size={16} /> {editingId ? 'Edit Mode' : 'Create New'}
          </button>
          <button 
            onClick={() => setViewMode('manage')}
            className={`flex-1 md:px-6 py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${viewMode === 'manage' ? 'bg-[#8B004A] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <List size={16} /> Manage Existing
          </button>
        </div>
      </div>

      {viewMode === 'manage' ? (
        // 🛠️ MANAGE CHAPTERS UI
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-fade-in">
          <h2 className="text-xl font-black text-gray-800 mb-6 border-b pb-4">All Live Chapters</h2>
          {existingChapters.length === 0 ? (
             <p className="text-center text-gray-400 py-10 font-bold">No chapters found. Go create one!</p>
          ) : (
            <div className="grid gap-4">
              {existingChapters.map((chap) => (
                <div key={chap._id} className="border-2 border-gray-100 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-[#8B004A]/30 transition-all">
                  <div>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded mb-2 inline-block ${chap.category === 'grammar' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {chap.category}
                    </span>
                    <h3 className="text-lg font-black text-gray-800">{chap.title}</h3>
                    <p className="text-xs font-bold text-gray-500">{chap.lessons?.length || 0} Topics (Lessons)</p>
                  </div>
                  <div className="flex w-full md:w-auto gap-2">
                    <button onClick={() => loadChapterForEdit(chap)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-blue-100 text-blue-600 px-4 py-2.5 rounded-lg font-bold transition-all text-xs">
                      <Edit2 size={16} /> Edit
                    </button>
                    <button onClick={() => deleteChapter(chap._id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg font-bold transition-all text-xs">
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // ✍️ CREATE / EDIT FORM UI
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
          
          <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-300 shadow-sm border-l-8 border-l-[#8B004A]">
            <div className="flex justify-between items-center mb-4">
               <h2 className="font-black text-lg md:text-xl text-gray-800">
                 {editingId ? 'Editing Chapter Data' : '1. Create New Chapter'}
               </h2>
               {editingId && <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">EDIT MODE ACTIVE</span>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="border-2 p-3 rounded-lg font-bold w-full" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="grammar">Grammar Book</option>
                <option value="realLife">Real-Life Talk</option>
              </select>
              <input type="text" placeholder="Chapter Title" value={chapterTitle} className="border-2 p-3 rounded-lg font-bold w-full" onChange={e => setChapterTitle(e.target.value)} required />
              <input type="text" placeholder="Chapter Subtitle" value={chapterSubtitle} className="border-2 p-3 rounded-lg font-bold w-full" onChange={e => setChapterSubtitle(e.target.value)} />
            </div>
          </div>

          {lessons.map((lesson, lIndex) => (
            <div key={lIndex} className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-md relative group">
              
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-black text-lg md:text-xl text-[#E01A76]">Topic {lIndex + 1}</h2>
                {lessons.length > 1 && (
                  <button type="button" onClick={() => deleteLessonBox(lIndex)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Topic Name (e.g. Noun)" value={lesson.lessonTitle} className="border-2 p-3 rounded-lg bg-gray-50 w-full font-bold" onChange={e => updateLesson(lIndex, 'lessonTitle', e.target.value)} required />
                <input type="text" placeholder="Video ID (e.g. fFMcolWgD3w)" value={lesson.videoId} className="border-2 p-3 rounded-lg bg-gray-50 w-full" onChange={e => updateLesson(lIndex, 'videoId', e.target.value)} />
              </div>

              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
                <h3 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wide flex justify-between items-center">
                  Live Video Popups 
                  <button type="button" onClick={() => addVideoQuiz(lIndex)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded">+ Add MCQ</button>
                </h3>
                {lesson.videoQuizzes.map((vq, vqIndex) => (
                  <div key={vqIndex} className="flex flex-col md:flex-row gap-2 mb-4 md:mb-2 bg-white md:bg-transparent p-3 md:p-0 rounded-lg border md:border-none border-blue-200">
                    <input type="number" placeholder="Sec (e.g. 15)" value={vq.time} className="border p-2 w-full md:w-24 rounded" onChange={e => updateVideoQuiz(lIndex, vqIndex, 'time', e.target.value)} />
                    <input type="text" placeholder="Question" value={vq.question} className="border p-2 w-full md:flex-1 rounded" onChange={e => updateVideoQuiz(lIndex, vqIndex, 'question', e.target.value)} />
                    <input type="text" placeholder="Options (A, B, C, D)" value={vq.options} className="border p-2 w-full md:flex-1 rounded" onChange={e => updateVideoQuiz(lIndex, vqIndex, 'options', e.target.value)} />
                    <input type="number" placeholder="Ans(0-3)" value={vq.correct} className="border p-2 w-full md:w-24 rounded" onChange={e => updateVideoQuiz(lIndex, vqIndex, 'correct', e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 mb-4">
                <h3 className="font-bold text-pink-800 mb-3 text-sm uppercase tracking-wide flex justify-between items-center">
                  Quick Test Questions
                  <button type="button" onClick={() => addStandaloneQuiz(lIndex)} className="text-xs bg-pink-600 text-white px-3 py-1.5 rounded">+ Add Question</button>
                </h3>
                {lesson.standaloneQuizzes.map((sq, sqIndex) => (
                  <div key={sqIndex} className="flex flex-col md:flex-row gap-2 mb-4 md:mb-2 bg-white md:bg-transparent p-3 md:p-0 rounded-lg border md:border-none border-pink-200">
                    <input type="text" placeholder="Question" value={sq.q} className="border p-2 w-full md:flex-1 rounded" onChange={e => updateStandaloneQuiz(lIndex, sqIndex, 'q', e.target.value)} />
                    <input type="text" placeholder="Options (A, B, C, D)" value={sq.o} className="border p-2 w-full md:flex-1 rounded" onChange={e => updateStandaloneQuiz(lIndex, sqIndex, 'o', e.target.value)} />
                    <input type="number" placeholder="Ans(0-3)" value={sq.c} className="border p-2 w-full md:w-24 rounded" onChange={e => updateStandaloneQuiz(lIndex, sqIndex, 'c', e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                <h3 className="font-bold text-green-800 mb-3 text-sm uppercase tracking-wide">Voice Practice</h3>
                <div className="flex flex-col md:flex-row gap-2">
                  <input type="text" placeholder="Hindi Sentence" value={lesson.speakingHindi} className="border p-2 w-full md:flex-1 rounded" onChange={e => updateLesson(lIndex, 'speakingHindi', e.target.value)} />
                  <input type="text" placeholder="English Target" value={lesson.speakingEnglish} className="border p-2 w-full md:flex-1 rounded" onChange={e => updateLesson(lIndex, 'speakingEnglish', e.target.value)} />
                </div>
              </div>

            </div>
          ))}

          <button type="button" onClick={addLesson} className="w-full bg-gray-200 text-gray-700 border-2 border-dashed border-gray-400 p-4 rounded-xl font-black text-sm md:text-lg hover:bg-gray-300 transition-all">
            ➕ Add Another Topic (Lesson) to this Chapter
          </button>

          <button type="submit" className={`w-full text-white p-4 md:p-5 rounded-xl font-black text-lg md:text-xl shadow-xl flex items-center justify-center gap-2 ${editingId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-[#8B004A] hover:bg-[#6a0038]'}`}>
            {editingId ? <CheckCircle /> : <PlusCircle />}
            {editingId ? 'Update Module & Go Back' : '🚀 Publish Complete Module to Live App'}
          </button>
        </form>
      )}
    </div>
  );
}
// src/components/PersonalVault.jsx

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import PremiumSoundFeature from "../PremiumSoundFeature";
import WordMatchGame from "../WordMatchGame";

export default function PersonalVault({
  user,
  API_URL,
  isPremiumUser,
  onOpenPost
}) {

  const [savedWords, setSavedWords] = useState([]);
  const [filter, setFilter] = useState("hard");
  const [loading, setLoading] = useState(true);

  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceType, setPracticeType] = useState("cards");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);

  const speakWord = (word) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word);

      utterance.lang = "en-US";
      utterance.rate = 0.8;

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchSavedWords(user.email);
    }
  }, [user]);

  const fetchSavedWords = async (email) => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/personal-vault/saved?email=${email}`
      );

      const data = await res.json();

      setSavedWords(Array.isArray(data) ? data : []);

    } catch (err) {

      setSavedWords([]);

    } finally {

      setLoading(false);
    }
  };

  const allFilteredWords = useMemo(() => {

    if (!Array.isArray(savedWords)) return [];

    const extracted = savedWords.flatMap((post) => {

      if (post.vocabData?.length > 0) {

        return post.vocabData
          .filter((item) =>
            item.wordStats?.some(
              (s) =>
                s.email === user.email &&
                s.level === filter
            )
          )
          .map((item) => ({
            ...item,

            _id: item._id,

            parentPostId: post._id,

            isDeckItem: true,

            sortTime:
              item.wordStats?.find(
                (s) => s.email === user.email
              )?.nextReview || post.createdAt,
          }));
      }

      const stat = post.userStats?.find(
        (s) => s.email === user.email
      );

      if (stat && stat.level === filter) {

        return [
          {
            word: post.word,

            meaning: post.meaning,

            _id: post._id,

            parentPostId: post._id,

            isDeckItem: false,

            sortTime:
              stat.nextReview || post.createdAt,
          },
        ];
      }

      return [];
    });

    return extracted.sort(
      (a, b) =>
        new Date(b.sortTime) -
        new Date(a.sortTime)
    );

  }, [savedWords, filter, user.email]);

  const practiceDueList = useMemo(() => {

    return allFilteredWords.filter((item) => {

      const stat = item.isDeckItem
        ? item.wordStats?.find(
            (s) => s.email === user.email
          )
        : savedWords
            .find(
              (p) =>
                p._id === item.parentPostId
            )
            ?.userStats?.find(
              (s) => s.email === user.email
            );

      if (!stat || !stat.nextReview)
        return true;

      return (
        new Date(stat.nextReview).getTime() <=
        new Date().getTime()
      );
    });

  }, [allFilteredWords]);

  const handleReview = async (intervalType) => {

    const currentItem =
      practiceDueList[currentIndex];

    if (!currentItem) return;

    let nextReviewDate = new Date();

    const intervals = {
      again: 1,
      hard: 6,
      good: 10,
      easy: 4320,
    };

    nextReviewDate.setMinutes(
      nextReviewDate.getMinutes() +
        intervals[intervalType]
    );

    try {

      const endpoint = !currentItem.isDeckItem
        ? `${API_URL}/api/personal-vault/update-stat/${currentItem.parentPostId}`
        : `${API_URL}/api/personal-vault/update-word-stat/${currentItem.parentPostId}/${currentItem._id}`;

      const res = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email: user.email,

          level: filter,

          nextReview: nextReviewDate,
        }),
      });

      if (res.ok) {

        if (
          currentIndex <
          practiceDueList.length - 1
        ) {

          setCurrentIndex((prev) => prev + 1);

          setShowMeaning(false);

        } else {

          setIsPracticeMode(false);

          toast.success(
            "Practice Session Done! 🏆"
          );

          fetchSavedWords(user.email);

          setCurrentIndex(0);
        }
      }

    } catch (err) {

      toast.error("Sync Failed");
    }
  };

  return (
    <div className="w-full">

      {isPracticeMode ? (
        <div className="w-full max-w-md flex flex-col items-center mt-10 animate-in fade-in zoom-in duration-500">

          {practiceType === "matching" ? (
            <WordMatchGame
              data={allFilteredWords.slice(0, 6)}
              onComplete={() => {
                setIsPracticeMode(false);

                fetchSavedWords(user.email);
              }}
            />
          ) : (
            <>
              <div className="text-center mb-10">

                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                  SRS ACTIVE RECALL
                </span>

                <div className="mt-2 px-4 py-1 bg-red-100 text-red-600 rounded-full text-[12px] font-black">
                  {currentIndex + 1} /{" "}
                  {practiceDueList.length}
                </div>
              </div>

              <div
                className="w-full relative"
                onClick={() =>
                  setShowMeaning(!showMeaning)
                }
              >
                <div className="w-full aspect-[4/5] bg-white rounded-[4rem] shadow-2xl flex flex-col items-center justify-center p-12 cursor-pointer border-2 border-gray-50 active:scale-95 transition-all">

                  <h2 className="text-5xl font-black text-gray-900 uppercase italic text-center leading-tight tracking-tighter">
                    {
                      practiceDueList[
                        currentIndex
                      ]?.word
                    }
                  </h2>

                  {showMeaning ? (
                    <p className="mt-10 text-2xl font-black text-red-500 italic uppercase animate-in slide-in-from-top-4">
                      {
                        practiceDueList[
                          currentIndex
                        ]?.meaning
                      }
                    </p>
                  ) : (
                    <p className="mt-10 text-[9px] font-black text-gray-300 uppercase tracking-widest animate-pulse">
                      Tap to reveal
                    </p>
                  )}
                </div>

                <div className="absolute top-8 right-8">
                  <PremiumSoundFeature
                    isPremiumUser={
                      isPremiumUser
                    }
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        speakWord(
                          practiceDueList[
                            currentIndex
                          ]?.word
                        );
                      }}
                      className="w-14 h-14 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center"
                    >
                      🔊
                    </button>
                  </PremiumSoundFeature>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12 w-full px-2">

                {showMeaning ? (
                  ["again", "hard", "good", "easy"].map(
                    (lvl) => (
                      <button
                        key={lvl}
                        onClick={() =>
                          handleReview(lvl)
                        }
                        className={`p-5 rounded-3xl font-black uppercase text-[10px] text-white shadow-lg active:scale-95 transition-all ${
                          lvl === "again"
                            ? "bg-black"
                            : lvl === "hard"
                            ? "bg-orange-500"
                            : lvl === "good"
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                      >
                        {lvl}
                      </button>
                    )
                  )
                ) : (
                  <button
                    onClick={() =>
                      setIsPracticeMode(false)
                    }
                    className="col-span-2 text-gray-300 text-[10px] font-black uppercase tracking-widest underline underline-offset-8"
                  >
                    End Session
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">

            <button
              onClick={() => {

                if (
                  practiceDueList.length > 0
                ) {

                  setPracticeType("cards");

                  setIsPracticeMode(true);

                } else {

                  toast.error(
                    "All caught up!"
                  );
                }
              }}
              className="w-full p-5 bg-red-50 text-red-600 rounded-[2rem] font-black uppercase tracking-widest text-[10px] border border-red-100 active:scale-95"
            >
              🎓 START SRS PRACTICE (
              {practiceDueList.length})
            </button>

            <button
              onClick={() => {

                if (
                  allFilteredWords.length >= 3
                ) {

                  setPracticeType(
                    "matching"
                  );

                  setIsPracticeMode(true);

                } else {

                  toast.error(
                    "Vault mein kam se kam 3 words hone chahiye! 📚"
                  );
                }
              }}
              className="w-full p-4 bg-gray-50 text-gray-500 rounded-[2rem] font-black uppercase tracking-widest text-[9px] border border-gray-100 active:scale-95"
            >
              🧩 PLAY MATCHING GAME (
              {allFilteredWords.length})
            </button>
          </div>

          <div className="w-full mt-12 px-2">

            <div className="flex bg-gray-200/50 p-1.5 rounded-[2rem] mb-8 shadow-inner overflow-x-auto no-scrollbar">

              {[
                "hard",
                "dailyUse",
                "heard",
                "easy",
              ].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setFilter(lvl);

                    setCurrentIndex(0);
                  }}
                  className={`flex-1 px-4 py-3 rounded-[1.5rem] text-[9px] font-black uppercase transition-all ${
                    filter === lvl
                      ? "bg-white shadow-md text-red-500 scale-105"
                      : "text-gray-400"
                  }`}
                >
                  {lvl === "dailyUse"
                    ? "Daily"
                    : lvl}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 text-center text-[10px] font-black text-gray-300 animate-pulse uppercase tracking-widest">
                Syncing Vault...
              </div>
            ) : allFilteredWords.length > 0 ? (
              <div className="space-y-4">

                {allFilteredWords.map(
                  (item, idx) => (
                    <div
                      key={`${item.parentPostId}-${idx}`}
                      onClick={() =>
                        onOpenPost(
                          item.parentPostId
                        )
                      }
                      className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group active:scale-95 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col">

                        <h4 className="text-2xl font-black text-gray-800 uppercase italic group-hover:text-red-500 transition-colors tracking-tighter leading-none mb-1">
                          {item.word}
                        </h4>

                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">
                          {item.isDeckItem
                            ? "DECK WORD"
                            : "HUB RECORD"}
                        </span>
                      </div>

                      <p
                        className={`text-sm font-black italic uppercase ${
                          filter === "hard"
                            ? "text-red-500"
                            : "text-blue-500"
                        }`}
                      >
                        {item.meaning}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center">
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest italic">
                  Vault Empty
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Plus, Trash2 } from "lucide-react";
import startImg from "./imgs/start.png";
import middleImg from "./imgs/middle.png";
import endImg from "./imgs/end.png";

const App = () => {
  const [timeLeft, setTimeLeft] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [plantStage, setPlantStage] = useState(0);
  const [isDead, setIsDead] = useState(false);
  const [showDeathPopup, setShowDeathPopup] = useState(false);
  const [todoItems, setTodoItems] = useState([]);
  const [todoInput, setTodoInput] = useState("");
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const addTodo = () => {
    const trimmed = todoInput.trim();
    if (trimmed) {
      setTodoItems((prev) => [...prev, trimmed]);
      setTodoInput("");
    }
  };

  const removeTodo = (index) => {
    setTodoItems((prev) => prev.filter((_, i) => i !== index));
  };

  const POMODORO_TIME = 3;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return POMODORO_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    const newSessions = sessionsCompleted + 1;
    setSessionsCompleted(newSessions);
    setPlantStage(Math.min(newSessions, 3));
  };

  const killPlantMidSession = () => {
    setIsDead(true);
    setPlantStage(0);
    setShowDeathPopup(true);
  };

  const toggleTimer = () => {
    if (isRunning) {
      // Pausing mid-session kills the plant
      if (
        startTimeRef.current != null &&
        timeLeft < startTimeRef.current
      ) {
        killPlantMidSession();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      startTimeRef.current = timeLeft;
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    // Resetting mid-session kills the plant
    if (
      isRunning &&
      startTimeRef.current != null &&
      timeLeft < startTimeRef.current
    ) {
      killPlantMidSession();
    }

    setIsRunning(false);
    setTimeLeft(POMODORO_TIME);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const restartProgress = () => {
    setSessionsCompleted(0);
    setPlantStage(0);
    setIsDead(false);
    setShowDeathPopup(false);
    setTimeLeft(POMODORO_TIME);
    setIsRunning(false);
    // To-do list is intentionally not reset
  };

  const progress = ((POMODORO_TIME - timeLeft) / POMODORO_TIME) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const stageImage = plantStage >= 2 ? endImg : plantStage >= 1 ? middleImg : startImg;
  const isStartStage = plantStage === 0;
  const stageImageX = isStartStage ? 160 : 110;
  const stageImageY = isStartStage ? 220 : 125;
  const stageImageSize = isStartStage ? 80 : 180;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col items-center justify-center p-8">
      {/* Plant died popup */}
      {showDeathPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="death-popup-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <p id="death-popup-title" className="text-xl font-bold text-red-700 mb-2">
              Your plant died!
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Don&apos;t give up mid-session — finish your timer to keep your plant alive.
            </p>
            <button
              onClick={() => setShowDeathPopup(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-green-800 mb-2">
          Pomodoro Plant
        </h1>
      </div>

      <div className="relative mb-8">
        <svg width="400" height="400" viewBox="0 0 400 400">
          {/* Ground */}
          <ellipse
            cx="200"
            cy="290"
            rx="80"
            ry="15"
            fill="#8B7355"
            opacity="0.3"
          />

          {/* Timer circle background */}
          <circle
            cx="200"
            cy="200"
            r="180"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="12"
          />

          {/* Timer circle progress */}
          <circle
            cx="200"
            cy="200"
            r="180"
            fill="none"
            stroke="#b91010"
            strokeWidth="12"
            strokeDasharray={`${2 * Math.PI * 180}`}
            strokeDashoffset={`${2 * Math.PI * 180 * (1 - progress / 100)}`}
            transform="rotate(-90 200 200)"
            strokeLinecap="round"
          />

          {/* Stage image */}
          <image
            href={stageImage}
            x={stageImageX}
            y={stageImageY}
            width={stageImageSize}
            height={stageImageSize}
            opacity={isDead ? 0.35 : 1}
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Timer text */}
          <text
            x="200"
            y="130"
            textAnchor="middle"
            fontSize="48"
            fontWeight="bold"
            fill="#1F2937"
          >
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </text>
        </svg>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={toggleTimer}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-105"
        >
          {isRunning ? <Pause size={32} /> : <Play size={32} />}
        </button>
        <button
          onClick={resetTimer}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-105"
        >
          <RotateCcw size={32} />
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-6 w-full max-w-2xl mb-6">
        {/* To-do list — left */}
        <div className="bg-white rounded-2xl p-6 shadow-xl w-full sm:w-72 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">To-do</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="Add an item..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={addTodo}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-2 transition-colors"
              aria-label="Add todo"
            >
              <Plus size={20} />
            </button>
          </div>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {todoItems.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-2 group text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
              >
                <span className="flex-1 truncate">{item}</span>
                <button
                  onClick={() => removeTodo(index)}
                  className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
            {todoItems.length === 0 && (
              <li className="text-gray-400 text-sm py-2">No items yet</li>
            )}
          </ul>
        </div>

        {/* Sessions completed — right */}
        <div className="bg-white rounded-2xl p-6 shadow-xl w-full sm:w-72 flex-shrink-0">
          <div className="text-center">
            <p className="text-gray-700 text-lg mb-2">
              Sessions Completed:{" "}
              <span className="font-bold text-green-700">
                {sessionsCompleted}
              </span>
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < sessionsCompleted ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            {isDead && (
              <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 mb-4">
                <p className="text-red-700 font-semibold mb-2">
                  Your plant died!
                </p>
                <p className="text-red-600 text-sm mb-3">
                  Don't give up mid-session!
                </p>
                <button
                  onClick={restartProgress}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Start Fresh
                </button>
              </div>
            )}
            {plantStage === 3 && !isDead && (
              <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 mb-4">
                <p className="text-green-700 font-semibold mb-2">Harvest Time!</p>
                <p className="text-green-600 text-sm mb-3">
                  You grew a tomato plant! Start over with a new seed to grow another.
                </p>
                <button
                  onClick={restartProgress}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Start over with a new seed
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-600 text-sm max-w-md">
        <p className="mb-2"> Each session is 25 minutes</p>
        <p className="mb-2"> Complete 3 sessions to grow a tomato</p>
        <p> Stopping mid-session will kill your plant!</p>
      </div>
    </div>
  );
};

export default App;

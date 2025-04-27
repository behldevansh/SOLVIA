import { useState, useEffect } from "react";
import { Loader2, CloudLightning, CloudRain, Cloud } from "lucide-react";

export default function BeautifulLoading() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect system color scheme preference on component mount
  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);

    const handleChange = (e) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener("change", handleChange);

    return () => darkModeQuery.removeEventListener("change", handleChange);
  }, []);

  // Simulate loading progress with 10s total duration
  useEffect(() => {
    // Setting 100ms interval for smoother animation
    // 10 seconds = 10000ms / 100ms = 100 steps
    // Each step increases progress by 1%
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Change phase for different icons
  useEffect(() => {
    const phaseTimer = setInterval(() => {
      setPhase((prev) => (prev + 1) % 4);
    }, 800);

    return () => clearInterval(phaseTimer);
  }, []);

  // Select icon based on current phase
  const getIcon = () => {
    const iconColor = isDarkMode ? "text-blue-400" : "text-blue-600";
    const pulseColor = isDarkMode ? "text-purple-400" : "text-purple-600";
    const cloudColor = isDarkMode ? "text-cyan-400" : "text-cyan-600";
    const rainColor = isDarkMode ? "text-indigo-400" : "text-indigo-600";

    switch (phase) {
      case 0:
        return <Loader2 className={`animate-spin ${iconColor}`} size={48} />;
      case 1:
        return <CloudLightning className={pulseColor} size={48} />;
      case 2:
        return <CloudRain className={cloudColor} size={48} />;
      case 3:
        return <Cloud className={rainColor} size={48} />;
      default:
        return <Loader2 className={`animate-spin ${iconColor}`} size={48} />;
    }
  };

  return (
    <div className={`flex flex-col my-12 items-center justify-center  `}>
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 shadow-xl w-10/12 h-full min-h-[400px] flex justify-center items-center flex-col"
            : "bg-white shadow-lg"
        } p-8 rounded-lg flex flex-col items-center`}
      >
        <div className="mb-6">{getIcon()}</div>
        <h2
          className={`text-xl font-bold mb-6 ${
            isDarkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          Loading data...
        </h2>
        <p
          className={`text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Please wait while we fetch the latest information.
        </p>

        {/* Progress bar without percentage
        <div
          className={`w-48 ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          } rounded-full h-2`}
        >
          <div
            className={`${
              isDarkMode
                ? "bg-gradient-to-r from-blue-500 to-purple-500"
                : "bg-gradient-to-r from-blue-600 to-purple-600"
            } h-2 rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div> */}

        {/* Animated dots */}
        <div className="flex mt-4 space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isDarkMode ? "bg-blue-400" : "bg-blue-600"
            } animate-pulse`}
          ></div>
          <div
            className={`w-2 h-2 rounded-full ${
              isDarkMode ? "bg-purple-400" : "bg-purple-600"
            } animate-pulse delay-150`}
          ></div>
          <div
            className={`w-2 h-2 rounded-full ${
              isDarkMode ? "bg-cyan-400" : "bg-cyan-600"
            } animate-pulse delay-300`}
          ></div>
        </div>
      </div>
    </div>
  );
}

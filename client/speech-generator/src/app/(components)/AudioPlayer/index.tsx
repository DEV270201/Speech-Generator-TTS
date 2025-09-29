"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Volume1 } from "lucide-react";
import { toast } from "react-hot-toast";
interface AudioPlayerProps {
  filename: string;
  duration: number;
  id: string;
  hideDesign?: boolean;
}

function AudioPlayer({
  filename,
  duration,
  id,
  hideDesign = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1); // 0 = mute, 1 = full

  useEffect(() => {
    const audioError = () => {
      toast.error("Error playing the audio. Please, try again later!");
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("error", audioError);
    }

    return () => {
      audioRef.current?.removeEventListener("error", audioError);
    };
  }, []);

  useEffect(() => {
    setAudioDuration(duration);
  }, [filename]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      console.log("cr: ", current);
      setCurrentTime(current);
      const percent = (current / audioRef.current.duration) * 100;
      setProgress(percent || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * audioDuration;
      console.log("newtime: ", newTime);
      console.log("audio: ", audioRef.current);
      audioRef.current.currentTime = newTime;
      console.log("ctime: ", audioRef.current.currentTime);
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleVolume = () => {
    if (!audioRef.current) return;

    if (volume === 0) {
      audioRef.current.volume = 1;
      setVolume(1);
    } else {
      audioRef.current.volume = 0;
      setVolume(0);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <>
      {hideDesign ? (
        <>
          <audio
            ref={audioRef}
            src={`http://127.0.0.1:8000/api/stream-audio/${id}`}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onError={() => {
              console.log("Error playing audio.");
            }}
          />

          <div className="flex w-full justify-start ml-2 items-center">
            <button
              onClick={togglePlay}
              className="p-2  bg-deepblack rounded-full border border-limegreen text-limegreen hover:bg-limegreen hover:text-darkaccent transition-colors"
            >
              {isPlaying ? (
                <Pause className="block sm:hidden" size={15} />
              ) : (
                <Play className="block sm:hidden" size={15} />
              )}
              {isPlaying ? (
                <Pause className="hidden sm:block" size={15} />
              ) : (
                <Play className="hidden sm:block" size={15} />
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="w-full max-w-xl bg-darkaccent text-gray-200 rounded-lg p-2 sm:p-4 flex flex-col gap-2 sm:gap-4 shadow-neutral-950 shadow-2xl my-4 mx-4">
            <audio
              ref={audioRef}
              src={`http://127.0.0.1:8000/api/stream-audio/${id}`}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                console.log("Error playing audio.");
              }}
            />

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={togglePlay}
                className="p-2 sm:p-3 bg-deepblack rounded-full border border-limegreen text-limegreen hover:bg-limegreen hover:text-darkaccent transition-colors"
              >
                {isPlaying ? (
                  <Pause className="block sm:hidden" size={15} />
                ) : (
                  <Play className="block sm:hidden" size={15} />
                )}
                {isPlaying ? (
                  <Pause className="hidden sm:block" size={20} />
                ) : (
                  <Play className="hidden sm:block" size={20} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="flex-1 h-2 bg-deepblack accent-limegreen rounded-lg cursor-pointer"
              />

              <button
                onClick={toggleVolume}
                className="p-2 rounded-full hover:bg-deepblack transition-colors"
              >
                {volume === 0 ? (
                  <VolumeX size={20} className="text-gray-300" />
                ) : volume < 0.5 ? (
                  <Volume1 size={20} className="text-gray-300" />
                ) : (
                  <Volume2 size={20} className="text-gray-300" />
                )}
              </button>
            </div>

            <div className="flex justify-between text-sm text-gray-400 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(audioDuration)}</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default AudioPlayer;

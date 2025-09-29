"use client";
import { useRef, useState } from "react";
import { toast } from 'react-hot-toast';
import AudioPlayer from "@/app/(components)/AudioPlayer";
import { usePost } from "@/app/(components)/CustomHooks/usePost";

export default function Home() {
  const [text, setText] = useState("");
  const textRef = useRef<String>("");
  const [audioDetails, setAudioDetails] = useState({
    filename: "",
    id: "",
    duration: 0.0,
    isGenerated: false
  })

  const { post, loading } = usePost({ url: "http://127.0.0.1:8000/api/generate-audio" });

  const updateText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let {value} = e.target;
    setText(value.replace(/\s+/g, ' '));
  }

  const generateAudio = async () => {
    try{
      const response = await post({ text });
      console.log("response: ", response);
      textRef.current = text;
      setAudioDetails({
        filename: response?.filename,
        id: response?.id,
        duration: response?.duration,
        isGenerated: true
      });
      toast.success(response?.message);
      return;
    }
   catch(err: any){
      console.log("Error generating audio: ", err);
      toast.error(err.message || "Something went wrong!");
      setAudioDetails({
        filename:'',
        id:'',
        duration: 0.0,
        isGenerated: false
      })
      return;
    }
  }

  return (
    <div className="w-full flex-1 flex justify-center items-center bg-darkaccent rounded">
      <div className="xl:w-[50%] md:w-[75%] h-full flex flex-col items-center">
        <div className="w-full flex flex-col items-center mt-8 text-gray-200 flex-1">
          <div className="w-full flex flex-col items-center justify-center p-3">
            <h1 className="text-lg lg:text-2xl font-medium text-center">
              Hello! Get your desired audio in just a click!
            </h1>
            <textarea
              className="w-full h-48 rounded bg-deepblack border border-gray-500 text-gray-300 p-3 outline-none mt-5 resize-none focus:border-limegreen/60 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Please input text for generating the audio!"
              value={text}
              onChange={updateText}
              disabled={loading}
            />

            <div className="w-full flex justify-end items-center my-2">
              <div className="font-semibold text-xs sm:text-md md:text-lg shadow-sm shadow-limegreen/35 p-1 rounded w-28 text-center mt-2">
                <span>{text.length >= 10 ? text.length : "0" + text.length}</span> / 175
              </div>
            </div>
            <button className="mt-2 w-full px-2 py-2 bg-darkaccent text-limegreen border border-limegreen rounded hover:bg-limegreen hover:text-darkaccent hover:cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={generateAudio}
              disabled={text.length === 0 || text.length > 175 || text.trim() === textRef.current.trim() || loading}
              >
             {loading ? 'Generating...' : 'Generate Audio'}
            </button>
            {
              loading && (
                <div className="mt-2 text-sm text-gray-400 italic text-center">
                  Audio is being generated, please be patient!
                </div>
              )
            }
          </div>
        </div>
        {
          audioDetails.isGenerated && (
            <AudioPlayer
              filename={audioDetails.filename}
              duration={audioDetails.duration}
              id={audioDetails.id}
            />
          )
        }
      </div>
    </div>
  );
}

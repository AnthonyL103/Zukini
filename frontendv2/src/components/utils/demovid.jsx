import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

const VideoPlayer = () => {
    const videoRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play();
          }
        },
        { threshold: 0.5 } // Video plays when at least 50% is visible
      );
  
      if (videoRef.current) {
        observer.observe(videoRef.current);
      }
  
      return () => {
        if (videoRef.current) {
          observer.unobserve(videoRef.current);
        }
      };
    }, []);

  return (
    <motion.div
      className="relative aspect-w-16 aspect-h-9 mb-16 rounded-3xl overflow-hidden shadow-2xl"
      initial="hidden"
      animate="visible"
    >
      {/* Video Player */}
      <video ref={videoRef} className="w-full h-full" playsInline 
  muted controls preload="auto"> 
        <source src="/DemoVid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Centered Play/Pause Button */}
      
    </motion.div>
  );
};

export default VideoPlayer;

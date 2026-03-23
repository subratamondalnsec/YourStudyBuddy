import React, { useRef, useState, useEffect } from 'react';

const CardStack = ({ title }) => {
  const [hover, setHover] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
    }
  }, [title]);

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}  
      
    >
      {/* Card Stack */}
      <div className="relative flex items-center justify-center w-full h-full cursor-pointer">
        <img
          src="flashcard-back.png"
          alt="flashcard"
          className={`absolute h-[55%] w-[36%] drop-shadow-md transition-all duration-300 ease-in-out ${
            hover ? 'translate-x-10 rotate-[20deg]' : ''
          }`}
          style={{ zIndex: 1 }}
        />
        <img
          src="flashcard-back.png"
          alt="flashcard"
          className={`absolute h-[55%] w-[36%] drop-shadow-md transition-all duration-300 ease-in-out ${
            hover ? '-translate-x-10 -rotate-[20deg]' : ''
          }`}
          style={{ zIndex: 2 }}
        />
        <img
          src="flashcard-back.png"
          alt="flashcard"
          className="absolute h-[55%] w-[36%] drop-shadow-xl z-10 scale-118 transition-transform duration-300"
        />
      </div>

      {/* Subject Title */}
      <div
        ref={containerRef}
        className="relative w-full h-[28px] overflow-hidden whitespace-nowrap mt-4 flex items-center justify-center"
      >
        {isOverflowing && hover ? (
          <div className="marquee-wrapper">
            <span className="marquee-text">{title}&nbsp;&nbsp;&nbsp;</span>
            <span className="marquee-text">{title}&nbsp;&nbsp;&nbsp;</span>
          </div>
        ) : (
          <p
            ref={textRef}
            className="text-lg font-semibold text-indigo-700 truncate"
          >
            {title}
          </p>
        )}
      </div>
    </div>
  );
};

export default CardStack;

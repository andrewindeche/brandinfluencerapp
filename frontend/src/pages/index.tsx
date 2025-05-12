import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

const HomePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleOpenModal = () => setShowModal(!showModal);
  const handleLoginRedirect = () => {
    router.push('/login');
    setShowModal(false);
  };

  const handleSignUpRedirect = () => {
    router.push('/signup');
    setShowModal(false);
  };

  useEffect(() => {
    // Simulate a loading delay (e.g., during server start or initial load)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-purple-700">
        <svg
          className="animate-spin h-12 w-12 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 01-8 8z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-transition min-h-screen flex flex-col justify-start items-center p-4 relative">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleOpenModal}
          className="custom-gradient-button bg-[var(--button-background)] text-[var(--button-foreground)] px-6 py-3 rounded-lg hover:shadow-lg transition-transform hover-effect"
        >
          Get Started
        </button>

        {showModal && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-4 px-6 z-50 transform origin-top-right transition-opacity duration-300 ease-in-out">
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleLoginRedirect}
                className="text-white px-4 py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105"
              >
                Log In
              </button>
              <button
                onClick={handleSignUpRedirect}
                className="custom-signup-button text-white px-4 py-2 rounded-lg"
              >
                Sign Up
              </button>
            </div>

            <div className="absolute top-[-0.4rem] right-4 w-4 h-4 bg-white rotate-45 transform"></div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center w-full mt-4 space-y-4 md:space-y-0 md:space-x-4 text-center">
        <h1 className="text-white text-5xl font-bold custom-underline">
          AFFLUENCER
        </h1>
        <h2 className="text-white text-2xl custom-underline2">
          Influencer MarketPlace
        </h2>
      </div>

      <div className="mt-6">
        <h3 className="text-2xl text-[#FFFF00] underline flicker-text">
          Our Influencers
        </h3>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-12 sm:space-y-2 sm:space-x-16 w-full px-4">
        <div
          className="relative w-full max-w-xs sm:w-[18rem] h-96 sm:h-[21rem] rounded-xl overflow-hidden shadow-lg border-4 transform rotate-6 transition-transform hover:scale-105 md:-ml-8"
          style={{ borderColor: '#023EBA' }}
        >
          <Image
            src="/images/woman2.png"
            alt="Amy - TikTok"
            layout="fill"
            objectFit="cover"
            className="object-cover"
          />
          <p className="influencer-name">AMY - TIK TOK</p>
        </div>

        <div
          className="relative w-full max-w-xs sm:w-[20rem] h-96 sm:h-[16rem] rounded-xl overflow-hidden shadow-lg border-4 transform -rotate-12 transition-transform hover:scale-105"
          style={{ borderColor: '#023EBA' }}
        >
          <Image
            src="/images/man.png"
            alt="Brad - YouTuber"
            layout="fill"
            objectFit="cover"
            sizes="(max-width: 900px) 100vw, 50vw"
            priority
            className="object-cover"
          />
          <p className="influencer-name">BRAD - YOU TUBER</p>
        </div>

        <div
          className="relative w-full max-w-xs sm:w-[20rem] h-96 sm:h-[20rem] rounded-xl overflow-hidden shadow-lg border-4 transform rotate-2 transition-transform hover:scale-105"
          style={{ borderColor: '#023EBA' }}
        >
          <Image
            src="/images/woman3.png"
            alt="Lizzie - Instagram"
            layout="fill"
            objectFit="cover"
            sizes="(max-width: 100px) 100vw, 50vw"
            className="object-cover"
          />
          <p className="influencer-name">LIZZIE - INSTAGRAM</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

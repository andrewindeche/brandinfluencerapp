import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

const BrandPage: React.FC = () => {
  const influencers = [
    {
      name: 'APRIL',
      likes: 100,
      message:
        "Influencer Network\nJoin our Influencer Network Today!\nI hope this message finds you well! My name is (Your Name) from (Your Brand), and we're excited to invite you to join our influencer network. We've been following your content on (Platform) and love how it aligns with our brand values.",
      image: '/images/image3.png',
      alt: 'Amy - TikTok',
      rotate: 'rotate-6',
    },
    {
      name: 'JESY',
      likes: 50,
      message:
        "Social Media\nJoin our tiktok account\nI hope this message finds you well! My name is (Your Name) from (Your Brand), and we're excited to invite you to join our influencer network. We've been following your content on (Platform) and love how it aligns with our brand values.",
      image: '/images/image2.png',
      alt: 'Brad - YouTuber',
    },
    {
      name: 'KATE',
      likes: 20,
      message:
        "Social Media\nJoin our tiktok account\nI hope this message finds you well! My name is (Your Name) from (Your Brand), and we're excited to invite you to join our influencer network. We've been following your content on (Platform) and love how it aligns with our brand values.",
      image: '/images/image1.png',
      alt: 'Lizzie - Instagram',
    },
  ];

  return (
    <div className="bg-[#005B96] min-h-screen flex flex-col justify-start items-center">
      <div className="flex justify-center space-x-4 mt-4">
        <button className="bg-[#FFFF00] text-black py-2 px-14 rounded-full border-2 border-black">
          Influencers
        </button>
        <button className="bg-red-500 text-white py-2 px-14 rounded-full border-2 border-white relative">
          campaigns
        </button>
      </div>
      <div className="mt-6">
        <h3 className="text-2xl text-[#FFFF00] underline">Submissions</h3>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row justify-center items-center space-y-12 sm:space-y-2 sm:space-x-20 w-full px-4">
        {influencers.map((influencer, index) => (
          <div
            key={index}
            className={`relative w-full max-w-xs sm:w-[12rem] h-[24rem] rounded-xl overflow-hidden shadow-lg transform ${influencer.rotate} transition-transform hover:scale-105`}
            style={{ borderColor: '#023EBA', backgroundColor: 'black' }}
          >
            <div className="absolute top-2 left-8 transform -translate-x-1/2 bg-black bg-opacity-30 text-white text-center px-2 py-1 rounded-lg font-bold text-sm sm:text-[7px]">
              {influencer.likes} likes
            </div>
            <Image
              src={influencer.image}
              alt={influencer.alt}
              layout="responsive"
              width={150}
              height={200}
              style={{ objectFit: 'cover' }}
              className="object-cover"
            />
            <div className="absolute bottom-20 w-full text-center">
              <p className="text-white text-2xl font-bold">{influencer.name}</p>
            </div>
            <div className="absolute bottom-0 w-full bg-black text-white text-[10px] py-4 px-4 rounded-t-lg">
              <p className="font-bold mb-1">
                {influencer.message.split('\n')[0]}
              </p>
              <p className="text-right text-gray-300 mt-2">16/01/2025</p>
              <p className="text-gray-300 mb-2">
                {influencer.message.split('\n')[1]}
              </p>
              <p>{influencer.message.split('\n').slice(2).join(' ')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default BrandPage;

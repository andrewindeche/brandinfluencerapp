import React from 'react';
import Slider from 'react-slick';
import Image from 'next/image';

const renderStars = (rating: number) => {
  return [...Array(5)].map((_, i) => (
    <svg
      key={i}
      className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.196-1.539-1.118l1.285-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.951-.69l1.286-3.967z" />
    </svg>
  ));
};

const testimonials = [
  {
    name: 'Acme Inc.',
    quote: 'Within a week, we found the perfect TikTok creator for our launch!',
    avatar: '/avatars/acme.png',
    rating: 5,
  },
  {
    name: '@LifestyleWithJen',
    quote: 'Reliable payments, smooth experience. Highly recommend!',
    avatar: '/avatars/jen.png',
    rating: 4,
  },
  {
    name: 'Brandify',
    quote: 'The influencer matching algorithm saved us hours of outreach.',
    avatar: '/avatars/brandify.png',
    rating: 5,
  },
];

const TestimonialCarousel: React.FC = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-16 px-4">
      <h3 className="text-3xl text-center text-white font-semibold mb-6">
        What People Are Saying
      </h3>
      <Slider {...settings}>
        {testimonials.map((t, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-lg text-center"
          >
            <div className="flex justify-center mb-4">
              <Image
                src={t.avatar}
                alt={t.name}
                width={64}
                height={64}
                className="rounded-full border-2 border-blue-500"
              />
            </div>
            <p className="text-gray-800 italic mb-4">“{t.quote}”</p>
            <div className="flex justify-center mb-2">
              {renderStars(t.rating)}
            </div>
            <p className="text-blue-700 font-bold">— {t.name}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TestimonialCarousel;

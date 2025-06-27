import React from 'react';
import Slider from 'react-slick';

const testimonials = [
  {
    name: 'Acme Inc.',
    quote: 'Within a week, we found the perfect TikTok creator for our launch!',
  },
  {
    name: '@LifestyleWithJen',
    quote: 'Reliable payments, smooth experience. Highly recommend!',
  },
  {
    name: 'Brandify',
    quote: 'The influencer matching algorithm saved us hours of outreach.',
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
            <p className="text-gray-800 italic mb-4">“{t.quote}”</p>
            <p className="text-blue-700 font-bold">— {t.name}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TestimonialCarousel;

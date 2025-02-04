import React from 'react';
import Image from 'next/image';

const ProfileCard: React.FC = () => {
  return (
    <div className="bg-black text-white p-6 rounded-lg mb-8">
      <Image
        src="/images/screenshots/HandM.jpg"
        alt="H&M Logo"
        width={150}
        height={150}
        className="mb-4"
      />
      <h3 className="text-lg font-bold mb-2">H & M Brands</h3>
      <h4 className="text-md mb-4">About</h4>
      <p className="text-sm mb-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel
        urna eros.
      </p>
      <div className="border-t border-gray-700 pt-4">
        <p className="text-sm">10 Campaigns</p>
        <p className="text-sm">8 Posts</p>
        <p className="text-sm">17 Submissions</p>
      </div>
    </div>
  );
};

export default ProfileCard;

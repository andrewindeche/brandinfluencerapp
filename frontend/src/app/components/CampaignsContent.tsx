import React from 'react';
import ProfileCard from '../components/ProfileCard';

const CampaignsContent: React.FC = () => {
  return (
    <div className="flex flex-row mt-4 space-x-4 w-full px-4">
      <div className="w-1/5">
        <ProfileCard />
      </div>
      <div className="flex-1 p-4 rounded-lg shadow-lg">
        <div className="p-4 grid grid-cols-3 gap-4 text-white rounded-lg border border-white justify-between">
          <div className="text-center">
            <h4 className="text-sm">Ambassadors</h4>
            <p className="text-lg font-bold">12</p>
          </div>
          <div className="text-center">
            <h4 className="text-sm">Total reach</h4>
            <p className="text-lg font-bold">9.8K</p>
          </div>
          <div className="text-center">
            <h4 className="text-sm">Submissions</h4>
            <p className="text-lg font-bold">20</p>
          </div>
          <div className="text-center">
            <h4 className="text-sm">Posts</h4>
            <p className="text-lg font-bold">30K</p>
          </div>
          <div className="text-center">
            <h4 className="text-sm">Likes</h4>
            <p className="text-lg font-bold">5K</p>
          </div>
          <div className="text-center">
            <h4 className="text-sm">Comments</h4>
            <p className="text-lg font-bold">60.2K</p>
          </div>
        </div>

        <div>
          <h3 className="text-white text-lg font-bold mb-2">New Campaigns</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <div className="bg-black rounded-lg text-white p-4">
              <img src="/path/to/image1.jpg" alt="Title 1" className="rounded-t-lg" />
              <p className="text-center mt-2">Title 1</p>
            </div>
            <div className="bg-black rounded-lg text-white p-4">
              <img src="/path/to/image2.jpg" alt="Title 2" className="rounded-t-lg" />
              <p className="text-center mt-2">Title 2</p>
            </div>
            <div className="bg-black rounded-lg text-white p-4">
              <img src="/path/to/image3.jpg" alt="Title 3" className="rounded-t-lg" />
              <p className="text-center mt-2">Title 3</p>
            </div>
            <div className="bg-black rounded-lg text-white p-4">
              <img src="/path/to/image4.jpg" alt="Title 4" className="rounded-t-lg" />
              <p className="text-center mt-2">Title 4</p>
            </div>
            <div className="bg-black rounded-lg text-white p-4">
              <img src="/path/to/image5.jpg" alt="Title 5" className="rounded-t-lg" />
              <p className="text-center mt-2">Title 5</p>
            </div>
            <div className="bg-black rounded-lg text-white p-4">
              <img src="/path/to/image6.jpg" alt="Title 6" className="rounded-t-lg" />
              <p className="text-center mt-2">Title 6</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/5">
        <div className="bg-orange-500 text-white p-6 rounded-lg text-center">
          <h4 className="text-4xl font-bold">2</h4>
          <p className="text-sm mt-2">Sport Campaign</p>
          <p className="text-xs mt-4">New</p>
          <p className="text-xs">16/01/2025</p>
        </div>

        <div className="bg-black text-white mt-4 p-4 rounded-lg text-center">
          <img src="/path/to/submission.jpg" alt="New Submission" className="rounded-t-lg" />
          <p className="mt-2">Social Media</p>
          <p className="text-xs mt-2">16/01/2025</p>
          <p className="text-xs mt-2">Join our TikTok account</p>
        </div>
      </div>
    </div>
  );
};

export default CampaignsContent;

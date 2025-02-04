import React from 'react';

const CampaignsContent: React.FC = () => {
  return (
    <div className="mt-4 flex justify-center items-center space-y-4 sm:space-y-2 w-full px-16">
      <div className="p-4 rounded-lg shadow-lg border border-white">
        <div className="grid grid-cols-3 gap-4 text-center text-white">
          <div>
            <h4 className="text-xs">Ambassadors</h4>
            <p className="text-base">12</p>
          </div>
          <div>
            <h4 className="text-xs">Total reach</h4>
            <p className="text-base">9.8K</p>
          </div>
          <div>
            <h4 className="text-xs">Submissions</h4>
            <p className="text-base">20</p>
          </div>
          <div>
            <h4 className="text-xs">Posts</h4>
            <p className="text-base">30k</p>
          </div>
          <div>
            <h4 className="text-xs">Likes</h4>
            <p className="text-base">5k</p>
          </div>
          <div>
            <h4 className="text-xs">Comments</h4>
            <p className="text-base">60.2k</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignsContent;

import { Construction } from 'lucide-react';

const UnderDevelopment = ({ feature = 'This feature' }) => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ffa116]/10 rounded-full mb-6">
          <Construction className="w-10 h-10 text-[#ffa116]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Under Development</h1>
        <p className="text-gray-400 max-w-md">
          {feature} is currently under development and will be available soon. 
          Check back later for updates!
        </p>
      </div>
    </div>
  );
};

export default UnderDevelopment;

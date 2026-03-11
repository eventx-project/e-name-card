import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-4">E-name-card</h1>
      <p className="text-xl text-gray-700 max-w-lg mb-8">
        The digital business card platform. Create your own card or view existing profiles.
      </p>
      
      <div className="space-y-4 w-full max-w-xs">
        <Link 
          href="/create"
          className="block w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Create New Card
        </Link>
        <div className="text-gray-400 text-sm mt-4">
            Have a card ID? Visit <span className="font-mono bg-gray-200 px-1 rounded">/user/[id]</span>
        </div>
      </div>

       <div className="absolute bottom-6 text-center">
       </div>
    </div>
  );
}

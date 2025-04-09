export default function BigRedBuzzer({ onClick }) {
    return (
      <div className="absolute flex items-center justify-center bg-transparent h-full w-full">
        <button
          onClick={onClick}
          className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-red-600 shadow-2xl shadow-red-900 border-4 border-red-800 animate-pulse cursor-pointer
                     hover:bg-red-700 active:scale-95 transition-all duration-150 ease-in-out"
        >
          <span className="text-white text-2xl md:text-3xl font-bold">STARTEN</span>
        </button>
      </div>
    );
  }
  
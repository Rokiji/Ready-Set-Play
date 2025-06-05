import { Gamepad } from "lucide-react";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-game-primary text-white">
      <Gamepad className="animate-spin-slow" size={96} />
      <span className="mt-8 text-5xl md:text-5xl sm:text-4xl xs:text-3xl font-extrabold tracking-wide drop-shadow-lg animate-bounce-loop text-center px-2">
        Ready, Set, Play
      </span>
      <style>
        {`
          @media (max-width: 640px) {
            .animate-spin-slow {
              width: 64px !important;
              height: 64px !important;
            }
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
          .animate-spin-slow {
            animation: spin-slow 1.5s linear infinite;
          }
          @keyframes bounce-loop {
            0%, 100% { transform: translateY(0); }
            20% { transform: translateY(-18px); }
            40% { transform: translateY(0); }
            60% { transform: translateY(-12px); }
            80% { transform: translateY(0); }
          }
          .animate-bounce-loop {
            animation: bounce-loop 1.4s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
          }
        `}
      </style>
    </div>
  );
} 

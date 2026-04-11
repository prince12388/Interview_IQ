import React from "react";
import { BsRobot } from "react-icons/bs";

function Footer() {
  return (
    <div className="relative flex justify-center px-4 pb-10 py-4 pt-10 bg-gradient-to-br from-cyan-100 via-sky-50 to-indigo-100">
      <div className="w-full max-w-6xl rounded-[24px] border border-white/45 bg-white/35 backdrop-blur-xl shadow-[0_12px_35px_rgba(14,116,144,0.18)] py-8 px-3 text-center">
        <div className="flex justify-center items-center gap-3 mb-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-2 rounded-lg shadow-md">
            <BsRobot size={16} />
          </div>
          <h2 className="font-semibold text-slate-800">InterviewIQ.AI</h2>
        </div>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          AI-powered interview preparation platform designed to improve
          communicaion skills, technical depth and professional confidence.
        </p>
      </div>
    </div>
  );
}

export default Footer;

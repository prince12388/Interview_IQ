import React, { useState } from 'react'
import { motion } from "motion/react"
import {
    FaUserTie,
    FaBriefcase,
    FaFileUpload,
    FaMicrophoneAlt,
    FaChartLine,
} from "react-icons/fa"

function Step1Setup({onStart}) {
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
  return (
    <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
    className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4'>

        <div className='w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden'>

            <motion.div
            initial={{ x: -80, opacity: 0}}
            animate={{ x: 0, opacity: 1}}
            transition={{ duration: 0.7}}
             className='relative bg-gradient-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center'>

                <h2 className='text-4xl font-bold text-gray-800 mb-6'>
                    Start Your AI Interview
                </h2>

                <p className='text-gray-600 mb-10'>
                    Practice real interview scenarios powered by AI.
                    Improve communication, technical skills, and confidence.
                </p>

                <div className='space-y-5'>
                    {
                        [
                            {
                                icon: <FaUserTie className='text-green-600 text-xl'/>,
                                text: "Choose Role & Experience",
                            },
                            {
                                icon: <FaMicrophoneAlt className='text-green-600 text-xl'/>,
                                text: "Smart Voice Interview",
                            },
                            {
                                icon: <FaChartLine className='text-green-600 text-xl'/>,
                                text: "Performance Analytics",
                            },          
                        ].map((item,index)=>(
                            <motion.div key={index}
                            initial={{ y: 30, opacity: 0}}
                            animate={{ y: 0, opacity: 1}}
                            transition={{ delay: 0.3 + index * 0.15}}
                            whileHover={{ scale: 1.03}}
                            
                            className='flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer'>
                                {item.icon}
                                <span className='text-gray-700 font-medium'>{item.text}</span>

                            </motion.div>
                        ))
                    }
                </div>

            </motion.div>

            <motion.div
            initial={{ x: 80, opacity: 0}}
            animate={{ x: 0, opacity: 1}}
            transition={{ duration: 0.7}}
            className='p-12 bg-white'>

                <h2 className='text-3xl font-bold text-gray-800 mb-8'>
                    Interview SetUp
                </h2>
                <div className='space-y-6'>

                    <div className='relative'>
                        <FaUserTie className='absolute top-4 left-4 text-gray-400'/>

                        <input type='text' placeholder='Enter role'
                        className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'
                        onChange={(e)=>setRole(e.target.value)} value={role}/>
                    </div>

                    <div className='relative'>
                        <FaBriefcase className='absolute top-4 left-4 text-gray-400'/>

                        <input type='text' placeholder='Experience (e.g.2 years)'
                        className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'
                        onChange={(e)=>setExperience(e.target.value)} value={experience}/>

                        
                    </div>
                    <select value={mode} 
                        onChange={(e)=>setMode(e.target.value)}
                        className='w-full py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'>

                            <option value="Technical">Technical Interview</option>
                            <option value="HR">HR Interview</option>

                        </select>
                </div>

            </motion.div>
        </div>
      
    </motion.div>
  )
}

export default Step1Setup

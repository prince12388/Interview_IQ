import React from "react";
import { useState } from "react";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";
import Step1Setup from "../components/Step1Setup";

function InterviewPage() {
<<<<<<< HEAD
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-sky-50 to-indigo-100">
      {step === 1 && (
        <Step1Setup
          onStart={(data) => {
            setInterviewData(data);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          onFinish={(report) => {
            setInterviewData(report);
            setStep(2);
          }}
        />
      )}
      {step === 3 && <Step3Report report={interviewData} />}
=======
    const [step,setStep] = useState(1)
    const [interviewData,setInterviewData] = useState(null)

  return (
    <div className='min-h-screen bg-gray-50'>
        {step===1 &&(
            <Step1Setup onStart={(data)=>{
                setInterviewData(data);
            setStep(2)}} />
        )}
        {step===2 &&(
            <Step2Interview interviewData={interviewData}
            onFinish={(report)=>{setInterviewData(report);
                setStep(3)
            }} />
        )}
        {step===3 &&(
            <Step3Report report={interviewData} />
        )}
      
>>>>>>> f3223d96a23bcb92b2399b6ca70eb4be4a1f3b4e
    </div>
  );
}

export default InterviewPage;

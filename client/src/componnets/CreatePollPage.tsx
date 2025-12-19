'use client';

import { useSocketActions } from '@/hooks/useSocketAction';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CreatePollPage = () => {
  const [timeLimit, setTimeLimit] = useState(60);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const { createPoll } = useSocketActions();

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    const filledOptions = options.filter((opt) => opt.trim());
    if (filledOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    createPoll({
      question: question.trim(),
      options: filledOptions.map((text) => ({
        id: uuidv4(),
        text: text.trim(),
      })),
      timeLimit,
    });
  };

  return (
    <div className="min-h-screen bg-white mt-5">
      <div>
        {/* Intervue Poll Badge */}
        <div className="w-33.5 h-7.75 rounded-3xl px-2.25 flex justify-center items-center gap-1.75 bg-linear-to-r from-[#7565d9] to-[#4d0acd]">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[14.656px] h-[14.652px] text-white"
          >
            <path
              d="M12.1296 8.5898C12.1308 8.79582 12.0682 8.99715 11.9503 9.1661C11.8324 9.33504 11.665 9.46328 11.4712 9.53317L8.20912 10.7332L7.00907 13.9933C6.9381 14.1865 6.80954 14.3533 6.64074 14.4711C6.47194 14.589 6.27105 14.6522 6.0652 14.6522C5.85935 14.6522 5.65846 14.589 5.48966 14.4711C5.32087 14.3533 5.1923 14.1865 5.12133 13.9933L3.91876 10.7373L0.658172 9.53721C0.465109 9.46614 0.298491 9.33757 0.180797 9.16883C0.0631039 9.0001 0 8.79932 0 8.59359C0 8.38787 0.0631039 8.18709 0.180797 8.01835C0.298491 7.84962 0.465109 7.72104 0.658172 7.64998L3.92028 6.44993L5.12032 3.19035C5.19139 2.99729 5.31996 2.83067 5.4887 2.71298C5.65743 2.59529 5.85821 2.53218 6.06394 2.53218C6.26966 2.53218 6.47044 2.59529 6.63918 2.71298C6.80791 2.83067 6.93649 2.99729 7.00755 3.19035L8.2076 6.45246L11.4672 7.6525C11.6608 7.72138 11.8283 7.84841 11.9469 8.0162C12.0655 8.18399 12.1293 8.38434 12.1296 8.5898ZM8.59262 2.52641H9.60319V3.53698C9.60319 3.67099 9.65642 3.79951 9.75118 3.89427C9.84594 3.98903 9.97446 4.04226 10.1085 4.04226C10.2425 4.04226 10.371 3.98903 10.4658 3.89427C10.5605 3.79951 10.6138 3.67099 10.6138 3.53698V2.52641H11.6243C11.7583 2.52641 11.8868 2.47318 11.9816 2.37842C12.0764 2.28366 12.1296 2.15514 12.1296 2.02113C12.1296 1.88712 12.0764 1.7586 11.9816 1.66384C11.8868 1.56908 11.7583 1.51585 11.6243 1.51585H10.6138V0.505283C10.6138 0.371273 10.5605 0.242753 10.4658 0.147994C10.371 0.053235 10.2425 0 10.1085 0C9.97446 0 9.84594 0.053235 9.75118 0.147994C9.65642 0.242753 9.60319 0.371273 9.60319 0.505283V1.51585H8.59262C8.45862 1.51585 8.33009 1.56908 8.23533 1.66384C8.14058 1.7586 8.08734 1.88712 8.08734 2.02113C8.08734 2.15514 8.14058 2.28366 8.23533 2.37842C8.33009 2.47318 8.45862 2.52641 8.59262 2.52641ZM14.1507 4.54754H13.6454V4.04226C13.6454 3.90825 13.5922 3.77973 13.4975 3.68497C13.4027 3.59021 13.2742 3.53698 13.1402 3.53698C13.0062 3.53698 12.8776 3.59021 12.7829 3.68497C12.6881 3.77973 12.6349 3.90825 12.6349 4.04226V4.54754H12.1296C11.9956 4.54754 11.8671 4.60078 11.7723 4.69554C11.6776 4.7903 11.6243 4.91882 11.6243 5.05283C11.6243 5.18683 11.6776 5.31536 11.7723 5.41011C11.8671 5.50487 11.9956 5.55811 12.1296 5.55811H12.6349V6.06339C12.6349 6.1974 12.6881 6.32592 12.7829 6.42068C12.8776 6.51544 13.0062 6.56867 13.1402 6.56867C13.2742 6.56867 13.4027 6.51544 13.4975 6.42068C13.5922 6.32592 13.6454 6.1974 13.6454 6.06339V5.55811H14.1507C14.2847 5.55811 14.4133 5.50487 14.508 5.41011C14.6028 5.31536 14.656 5.18683 14.656 5.05283C14.656 4.91882 14.6028 4.7903 14.508 4.69554C14.4133 4.60078 14.2847 4.54754 14.1507 4.54754Z"
              fill="white"
            />
          </svg>
          <span className="text-sm font-semibold text-white">
            Intervue Poll
          </span>
        </div>

        {/* Page Header */}
        <div className="mt-5 w-165 text-left">
          <h1 className="text-[40px] font-normal leading-[90%] text-black">
            {`Let's `}
            <span className="text-[40px] font-semibold leading-none">
              Get Started
            </span>
          </h1>
          <p className="mt-3 text-[19px] font-normal leading-none text-black/50">
            {`you'll have the ability to create and manage polls, ask questions,
            and monitor your student's responses in real-time.`}
          </p>
        </div>

        {/* Poll Creation Card */}
        <div className="w-216.25 mt-8">
          {/* Card Header */}
          <div className="w-full h-10.75 flex justify-between items-center">
            <p className="text-xl font-semibold text-black">
              Enter your question
            </p>
            <div className="relative">
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="rounded-[7px] py-2.5 px-4.5 pr-10 bg-[#f1f1f1] text-lg font-normal text-black appearance-none cursor-pointer w-full focus:outline-none"
              >
                <option value="60">60 seconds</option>
                <option value="30">30 seconds</option>
              </select>
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                width="17"
                height="14"
                viewBox="0 0 17 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.37958 13.5922L-1.34336e-05 0.186231L16.4534 -0.000102124L8.37958 13.5922Z"
                  fill="#480FB3"
                />
              </svg>
            </div>
          </div>

          {/* Card Body */}
          <div className="w-full mt-5">
            <textarea
              className="w-full resize-none rounded-sm bg-[#f2f2f2] border-none outline-none p-2 text-lg font-normal"
              rows={3}
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            ></textarea>
          </div>

          <div className="w-full mt-2">
            <div className="w-full h-10.75 flex justify-between items-center">
              <p className="text-xl font-semibold text-black">Edit options</p>
            </div>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="shrink-0 w-6 h-6 bg-gray-100 rounded-[22px] bg-[linear-gradient(243.94deg,#8F64E1_-50.82%,#4E377B_216.33%)] flex items-center justify-center text-[11px] font-semibold  text-white">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2 bg-[#F2F2F2] rounded-xs text-[18px] font-normal"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="shrink-0 px-4 py-2 bg-red-100 text-red-600 rounded-xs hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button
                onClick={handleAddOption}
                className="mt-5 ml-7.5 w-42.25 h-11.25 text-[14px] font-semibold py-2 border-2 border-[#7451B6] rounded-[11px] text-[#7C57C2]"
              >
                + Add more options
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full fixed left-0 bottom-0 border-t flex justify-end px-10 z-10 bg-white">
        <div onClick={() => handleSubmit()} style={{ marginBlock: 20 }}>
          <div className="w-[233.93px] h-[57.58px] text-[18px] bg-linear-to-r from-[#8f64e1] to-[#1d68bd] rounded-[34px]  font-semibold text-lg leading-[100%] flex justify-center items-center text-white cursor-pointer">
            Ask Question
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePollPage;

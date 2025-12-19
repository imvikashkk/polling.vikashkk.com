'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useSocketActions } from '@/hooks/useSocketAction';
import { selectUserName, selectUserId } from '@/store/slices/userSlice';
import { selectIsSessionActive } from '@/store/slices/sessionSlice';
import {
  selectCurrentPoll,
  selectHasAnswered,
  selectMyAnswer,
  selectResultsWithPercentages,
  selectTimeRemainingFormatted,
  selectIsPollActive,
} from '@/store/slices/pollSlice';
import { ChatPopup } from '@/componnets/shared/ChatPopup';

export default function StudentPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const { joinSession, submitAnswer, disconnect } = useSocketActions();

  const userName = useAppSelector(selectUserName);
  const userId = useAppSelector(selectUserId);
  const isSessionActive = useAppSelector(selectIsSessionActive);
  const currentPoll = useAppSelector(selectCurrentPoll);
  const hasAnswered = useAppSelector(selectHasAnswered);
  const myAnswer = useAppSelector(selectMyAnswer);
  const results = useAppSelector(selectResultsWithPercentages);
  const timeRemaining = useAppSelector(selectTimeRemainingFormatted);
  const isPollActive = useAppSelector(selectIsPollActive);

  const handleSubmit = () => {
    if (selectedOptionId && currentPoll) {
      submitAnswer(selectedOptionId);
    }
  };

  if (!isSessionActive) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center flex-col p-4">
        <div className="w-33.5 h-7.75 rounded-3xl pr-2.25 pl-2.25 flex justify-center items-center gap-1.75 bg-linear-to-r from-[#7565d9] to-[#4d0acd]">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[14.656px] h-[14.652px] opacity-100 text-white"
          >
            <path
              d="M12.1296 8.5898C12.1308 8.79582 12.0682 8.99715 11.9503 9.1661C11.8324 9.33504 11.665 9.46328 11.4712 9.53317L8.20912 10.7332L7.00907 13.9933C6.9381 14.1865 6.80954 14.3533 6.64074 14.4711C6.47194 14.589 6.27105 14.6522 6.0652 14.6522C5.85935 14.6522 5.65846 14.589 5.48966 14.4711C5.32087 14.3533 5.1923 14.1865 5.12133 13.9933L3.91876 10.7373L0.658172 9.53721C0.465109 9.46614 0.298491 9.33757 0.180797 9.16883C0.0631039 9.0001 0 8.79932 0 8.59359C0 8.38787 0.0631039 8.18709 0.180797 8.01835C0.298491 7.84962 0.465109 7.72104 0.658172 7.64998L3.92028 6.44993L5.12032 3.19035C5.19139 2.99729 5.31996 2.83067 5.4887 2.71298C5.65743 2.59529 5.85821 2.53218 6.06394 2.53218C6.26966 2.53218 6.47044 2.59529 6.63918 2.71298C6.80791 2.83067 6.93649 2.99729 7.00755 3.19035L8.2076 6.45246L11.4672 7.6525C11.6608 7.72138 11.8283 7.84841 11.9469 8.0162C12.0655 8.18399 12.1293 8.38434 12.1296 8.5898ZM8.59262 2.52641H9.60319V3.53698C9.60319 3.67099 9.65642 3.79951 9.75118 3.89427C9.84594 3.98903 9.97446 4.04226 10.1085 4.04226C10.2425 4.04226 10.371 3.98903 10.4658 3.89427C10.5605 3.79951 10.6138 3.67099 10.6138 3.53698V2.52641H11.6243C11.7583 2.52641 11.8868 2.47318 11.9816 2.37842C12.0764 2.28366 12.1296 2.15514 12.1296 2.02113C12.1296 1.88712 12.0764 1.7586 11.9816 1.66384C11.8868 1.56908 11.7583 1.51585 11.6243 1.51585H10.6138V0.505283C10.6138 0.371273 10.5605 0.242753 10.4658 0.147994C10.371 0.053235 10.2425 0 10.1085 0C9.97446 0 9.84594 0.053235 9.75118 0.147994C9.65642 0.242753 9.60319 0.371273 9.60319 0.505283V1.51585H8.59262C8.45862 1.51585 8.33009 1.56908 8.23533 1.66384C8.14058 1.7586 8.08734 1.88712 8.08734 2.02113C8.08734 2.15514 8.14058 2.28366 8.23533 2.37842C8.33009 2.47318 8.45862 2.52641 8.59262 2.52641ZM14.1507 4.54754H13.6454V4.04226C13.6454 3.90825 13.5922 3.77973 13.4975 3.68497C13.4027 3.59021 13.2742 3.53698 13.1402 3.53698C13.0062 3.53698 12.8776 3.59021 12.7829 3.68497C12.6881 3.77973 12.6349 3.90825 12.6349 4.04226V4.54754H12.1296C11.9956 4.54754 11.8671 4.60078 11.7723 4.69554C11.6776 4.7903 11.6243 4.91882 11.6243 5.05283C11.6243 5.18683 11.6776 5.31536 11.7723 5.41011C11.8671 5.50487 11.9956 5.55811 12.1296 5.55811H12.6349V6.06339C12.6349 6.1974 12.6881 6.32592 12.7829 6.42068C12.8776 6.51544 13.0062 6.56867 13.1402 6.56867C13.2742 6.56867 13.4027 6.51544 13.4975 6.42068C13.5922 6.32592 13.6454 6.1974 13.6454 6.06339V5.55811H14.1507C14.2847 5.55811 14.4133 5.50487 14.508 5.41011C14.6028 5.31536 14.656 5.18683 14.656 5.05283C14.656 4.91882 14.6028 4.7903 14.508 4.69554C14.4133 4.60078 14.2847 4.54754 14.1507 4.54754Z"
              fill="white"
            />
          </svg>
          <span className="w-22.75 h-4.5 opacity-100  font-semibold text-[14px] text-white">
            Intervue Poll
          </span>
        </div>

        <div className="mt-7.5 w-165 h-25.75 gap-6.5 opacity-100 text-center">
          <h1 className=" opacity-100  font-normal text-[40px] text-center text-black">
            {`Let's `}
            <span className=" font-semibold text-[40px]  text-center">
              Get Started
            </span>
          </h1>
          <p className="opacity-100  font-normal text-[19px] leading-[110%] text-center text-black/50">
            If you&apos;re a student, you&apos;ll be able to{' '}
            <span style={{ fontWeight: 600, color: '#000000' }}>
              submit your answers
            </span>
            , participate in live polls, and see how your responses compare with
            your classmates
          </p>
        </div>
      </div>
    );
  }

  /* Name Input */
  if (!userId || !userName) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center flex-col p-4">
        <div className="w-33.5 h-7.75 rounded-3xl pr-2.25 pl-2.25 flex justify-center items-center gap-1.75 bg-linear-to-r from-[#7565d9] to-[#4d0acd]">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[14.656px] h-[14.652px] opacity-100 text-white"
          >
            <path
              d="M12.1296 8.5898C12.1308 8.79582 12.0682 8.99715 11.9503 9.1661C11.8324 9.33504 11.665 9.46328 11.4712 9.53317L8.20912 10.7332L7.00907 13.9933C6.9381 14.1865 6.80954 14.3533 6.64074 14.4711C6.47194 14.589 6.27105 14.6522 6.0652 14.6522C5.85935 14.6522 5.65846 14.589 5.48966 14.4711C5.32087 14.3533 5.1923 14.1865 5.12133 13.9933L3.91876 10.7373L0.658172 9.53721C0.465109 9.46614 0.298491 9.33757 0.180797 9.16883C0.0631039 9.0001 0 8.79932 0 8.59359C0 8.38787 0.0631039 8.18709 0.180797 8.01835C0.298491 7.84962 0.465109 7.72104 0.658172 7.64998L3.92028 6.44993L5.12032 3.19035C5.19139 2.99729 5.31996 2.83067 5.4887 2.71298C5.65743 2.59529 5.85821 2.53218 6.06394 2.53218C6.26966 2.53218 6.47044 2.59529 6.63918 2.71298C6.80791 2.83067 6.93649 2.99729 7.00755 3.19035L8.2076 6.45246L11.4672 7.6525C11.6608 7.72138 11.8283 7.84841 11.9469 8.0162C12.0655 8.18399 12.1293 8.38434 12.1296 8.5898ZM8.59262 2.52641H9.60319V3.53698C9.60319 3.67099 9.65642 3.79951 9.75118 3.89427C9.84594 3.98903 9.97446 4.04226 10.1085 4.04226C10.2425 4.04226 10.371 3.98903 10.4658 3.89427C10.5605 3.79951 10.6138 3.67099 10.6138 3.53698V2.52641H11.6243C11.7583 2.52641 11.8868 2.47318 11.9816 2.37842C12.0764 2.28366 12.1296 2.15514 12.1296 2.02113C12.1296 1.88712 12.0764 1.7586 11.9816 1.66384C11.8868 1.56908 11.7583 1.51585 11.6243 1.51585H10.6138V0.505283C10.6138 0.371273 10.5605 0.242753 10.4658 0.147994C10.371 0.053235 10.2425 0 10.1085 0C9.97446 0 9.84594 0.053235 9.75118 0.147994C9.65642 0.242753 9.60319 0.371273 9.60319 0.505283V1.51585H8.59262C8.45862 1.51585 8.33009 1.56908 8.23533 1.66384C8.14058 1.7586 8.08734 1.88712 8.08734 2.02113C8.08734 2.15514 8.14058 2.28366 8.23533 2.37842C8.33009 2.47318 8.45862 2.52641 8.59262 2.52641ZM14.1507 4.54754H13.6454V4.04226C13.6454 3.90825 13.5922 3.77973 13.4975 3.68497C13.4027 3.59021 13.2742 3.53698 13.1402 3.53698C13.0062 3.53698 12.8776 3.59021 12.7829 3.68497C12.6881 3.77973 12.6349 3.90825 12.6349 4.04226V4.54754H12.1296C11.9956 4.54754 11.8671 4.60078 11.7723 4.69554C11.6776 4.7903 11.6243 4.91882 11.6243 5.05283C11.6243 5.18683 11.6776 5.31536 11.7723 5.41011C11.8671 5.50487 11.9956 5.55811 12.1296 5.55811H12.6349V6.06339C12.6349 6.1974 12.6881 6.32592 12.7829 6.42068C12.8776 6.51544 13.0062 6.56867 13.1402 6.56867C13.2742 6.56867 13.4027 6.51544 13.4975 6.42068C13.5922 6.32592 13.6454 6.1974 13.6454 6.06339V5.55811H14.1507C14.2847 5.55811 14.4133 5.50487 14.508 5.41011C14.6028 5.31536 14.656 5.18683 14.656 5.05283C14.656 4.91882 14.6028 4.7903 14.508 4.69554C14.4133 4.60078 14.2847 4.54754 14.1507 4.54754Z"
              fill="white"
            />
          </svg>
          <span className="w-22.75 h-4.5 opacity-100  font-semibold text-[14px] text-white">
            Intervue Poll
          </span>
        </div>

        <div className="mt-7.5 w-165 h-25.75 gap-6.5 opacity-100 text-center">
          <h1 className=" opacity-100  font-normal text-[40px] text-center text-black">
            {`Let's `}
            <span className=" font-semibold text-[40px]  text-center">
              Get Started
            </span>
          </h1>
          <p className="opacity-100  font-normal text-[19px] leading-[110%] text-center text-black/50">
            If you&apos;re a student, you&apos;ll be able to{' '}
            <span style={{ fontWeight: 600, color: '#000000' }}>
              submit your answers
            </span>
            , participate in live polls, and see how your responses compare with
            your classmates
          </p>
        </div>

        <div className="mt-7.5 flex flex-col justify-start w-126.75 h-23.75 gap-3 opacity-100">
          <label htmlFor="name" className="text-[18px]">
            Enter your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g., Vikash KK"
            className="w-126.75 h-15 rounded-xs opacity-100 bg-[#f2f2f2] border-none outline-none px-5.75  font-normal text-lg leading-[100%]"
          />
        </div>

        <div style={{ marginTop: 50 }}>
          <button
            className="w-[233.93px] h-[57.58px] bg-linear-to-r from-[#8f64e1] to-[#1d68bd] rounded-[34px]  font-semibold text-lg leading-[100%] flex justify-center items-center text-white cursor-pointer"
            onClick={() => studentName.trim() && joinSession(studentName)}
            disabled={!studentName.trim()}
          >
            continue
          </button>
        </div>
      </div>
    );
  }

  // // Session not active

  /* Waiting Poll */
  if (!currentPoll || !isPollActive) {
    return (
      <div className=" bg-linear-to-br from-purple-50 to-blue-50">
        <div className="bg-white border-b border-gray-200 fixed left-0 right-0 top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-bold text-gray-800">Student View</h1>
                <p className="text-sm text-gray-600">Name: {userName}</p>
              </div>
            </div>
            <button
              onClick={() => {
                disconnect();
                router.push('/');
              }}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Leave
            </button>
          </div>
        </div>

        {/* Waiting Content */}
        <WaitMessage></WaitMessage>

        {/* Chat Popup & Participants */}
        <ChatPopup />
      </div>
    );
  }

  /* Poll active - Show question */
  if (!hasAnswered) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center flex-col p-4">
        <div>
          <div className="flex justify-between items-center gap-10">
            <div className="flex justify-start items-center gap-10">
              <p className="font-semibold text-xl leading-none text-black">
                Question 1
              </p>
              <div className="flex gap-2.5 items-center">
                <svg
                  width="16"
                  height="20"
                  viewBox="0 0 16 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4.5 h-5"
                >
                  <path
                    d="M14.3 6.09L15.21 5.19C15.3983 5.0017 15.5041 4.7463 15.5041 4.48C15.5041 4.2137 15.3983 3.9583 15.21 3.77C15.0217 3.5817 14.7663 3.47591 14.5 3.47591C14.2337 3.47591 13.9783 3.5817 13.79 3.77L12.89 4.68C11.4886 3.59585 9.76687 3.00764 7.99503 3.00764C6.22318 3.00764 4.50147 3.59585 3.10003 4.68L2.19003 3.76C2.0004 3.5717 1.74373 3.46644 1.47649 3.46737C1.20925 3.46831 0.95333 3.57537 0.765026 3.765C0.576722 3.95463 0.471462 4.2113 0.472399 4.47854C0.473337 4.74578 0.580396 5.0017 0.770026 5.19L1.69003 6.1C0.593042 7.49755 -0.00218316 9.22334 2.6229e-05 11C-0.00323946 12.2754 0.29849 13.5331 0.88005 14.6683C1.46161 15.8034 2.30614 16.783 3.34322 17.5254C4.38029 18.2679 5.57985 18.7516 6.84184 18.9362C8.10383 19.1208 9.39168 19.0011 10.598 18.5869C11.8043 18.1727 12.8941 17.4761 13.7764 16.5552C14.6588 15.6342 15.3082 14.5157 15.6705 13.2928C16.0328 12.0699 16.0974 10.7781 15.859 9.52514C15.6206 8.27219 15.0861 7.0944 14.3 6.09ZM8.00003 17C6.81334 17 5.6533 16.6481 4.6666 15.9888C3.67991 15.3295 2.91087 14.3925 2.45675 13.2961C2.00262 12.1997 1.8838 10.9933 2.11531 9.82946C2.34683 8.66557 2.91827 7.59647 3.75739 6.75736C4.5965 5.91824 5.6656 5.3468 6.82948 5.11529C7.99337 4.88378 9.19977 5.0026 10.2961 5.45672C11.3925 5.91085 12.3296 6.67988 12.9888 7.66658C13.6481 8.65327 14 9.81331 14 11C14 12.5913 13.3679 14.1174 12.2427 15.2426C11.1174 16.3679 9.59133 17 8.00003 17ZM6.00003 2H10C10.2652 2 10.5196 1.89464 10.7071 1.70711C10.8947 1.51957 11 1.26522 11 1C11 0.734784 10.8947 0.48043 10.7071 0.292893C10.5196 0.105357 10.2652 0 10 0H6.00003C5.73481 0 5.48046 0.105357 5.29292 0.292893C5.10538 0.48043 5.00003 0.734784 5.00003 1C5.00003 1.26522 5.10538 1.51957 5.29292 1.70711C5.48046 1.89464 5.73481 2 6.00003 2ZM9.00003 8C9.00003 7.73478 8.89467 7.48043 8.70713 7.29289C8.5196 7.10536 8.26524 7 8.00003 7C7.73481 7 7.48046 7.10536 7.29292 7.29289C7.10538 7.48043 7.00003 7.73478 7.00003 8V9.89C6.7736 10.0925 6.614 10.359 6.54235 10.6542C6.47069 10.9495 6.49037 11.2595 6.59877 11.5433C6.70717 11.8271 6.89918 12.0712 7.14939 12.2435C7.39961 12.4158 7.69624 12.508 8.00003 12.508C8.30381 12.508 8.60044 12.4158 8.85066 12.2435C9.10088 12.0712 9.29289 11.8271 9.40129 11.5433C9.50968 11.2595 9.52936 10.9495 9.45771 10.6542C9.38606 10.359 9.22646 10.0925 9.00003 9.89V8Z"
                    fill="black"
                  />
                </svg>
                <span className="text-[#cb1206] font-semibold text-lg">
                  {timeRemaining}
                </span>
              </div>
            </div>
            <p className="text-white bg-[#7765DA]/90 rounded-md px-2 py-1 font-semibold">
              You: {userName}
            </p>
          </div>

          <div className="mt-2.5 flex flex-col items-end">
            <div className="w-181.75 rounded-[9px] border border-[#af8ff1]">
              <div className="w-181.75 min-h-12.5 pl-4 rounded-t-[10px] bg-linear-to-r from-[#343434] to-[#6e6e6e] flex items-center">
                <p className="font-semibold text-[17px] text-white">
                  {currentPoll.question}
                </p>
              </div>

              <div className="mt-4.5 px-4 py-4.5 flex flex-col gap-3.75">
                {currentPoll.options.map((option, index) => {
                  if (option.id === selectedOptionId) {
                    return (
                      <div
                        key={option.id}
                        className="w-full rounded-md px-5.75 py-4 border-[1.5px] border-[#8f64e1] flex items-center gap-2.5"
                      >
                        <span className="w-6 h-6 rounded-full bg-linear-to-br from-[#8f64e1] to-[#4e377b] flex justify-center items-center text-white font-semibold text-[11px] leading-none">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="font-normal text-base leading-none text-[#2e2e2e]">
                          {option.text}
                        </span>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={option.id}
                        onClick={() => setSelectedOptionId(option.id)}
                        className="w-full rounded-md px-5.75 py-4 bg-[#f6f6f6] border border-[#8d8d8d]/19 flex items-center gap-2.5"
                      >
                        <span className="w-6 h-6 rounded-full bg-[#8d8d8d] flex justify-center items-center text-white font-semibold text-[11px] leading-none">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="font-normal text-base leading-none text-[#2e2e2e]">
                          {option.text}
                        </span>
                      </div>
                    );
                  }
                })}
              </div>
            </div>

            <div onClick={() => handleSubmit()} style={{ marginTop: 30 }}>
              <div className="w-[233.93px] h-[57.58px] bg-linear-to-r from-[#8f64e1] to-[#1d68bd] rounded-[34px]  font-semibold text-lg leading-[100%] flex justify-center items-center text-white cursor-pointer">
                continue
              </div>
            </div>
          </div>
        </div>

        <ChatPopup />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center flex-col p-4">
      <div>
        <div className="flex justify-between items-center gap-10">
          <div className="flex justify-start items-center gap-10">
            <p className="font-semibold text-xl leading-none text-black">
              Question 1
            </p>
            <div className="flex gap-2.5 items-center">
              <svg
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4.5 h-5"
              >
                <path
                  d="M14.3 6.09L15.21 5.19C15.3983 5.0017 15.5041 4.7463 15.5041 4.48C15.5041 4.2137 15.3983 3.9583 15.21 3.77C15.0217 3.5817 14.7663 3.47591 14.5 3.47591C14.2337 3.47591 13.9783 3.5817 13.79 3.77L12.89 4.68C11.4886 3.59585 9.76687 3.00764 7.99503 3.00764C6.22318 3.00764 4.50147 3.59585 3.10003 4.68L2.19003 3.76C2.0004 3.5717 1.74373 3.46644 1.47649 3.46737C1.20925 3.46831 0.95333 3.57537 0.765026 3.765C0.576722 3.95463 0.471462 4.2113 0.472399 4.47854C0.473337 4.74578 0.580396 5.0017 0.770026 5.19L1.69003 6.1C0.593042 7.49755 -0.00218316 9.22334 2.6229e-05 11C-0.00323946 12.2754 0.29849 13.5331 0.88005 14.6683C1.46161 15.8034 2.30614 16.783 3.34322 17.5254C4.38029 18.2679 5.57985 18.7516 6.84184 18.9362C8.10383 19.1208 9.39168 19.0011 10.598 18.5869C11.8043 18.1727 12.8941 17.4761 13.7764 16.5552C14.6588 15.6342 15.3082 14.5157 15.6705 13.2928C16.0328 12.0699 16.0974 10.7781 15.859 9.52514C15.6206 8.27219 15.0861 7.0944 14.3 6.09ZM8.00003 17C6.81334 17 5.6533 16.6481 4.6666 15.9888C3.67991 15.3295 2.91087 14.3925 2.45675 13.2961C2.00262 12.1997 1.8838 10.9933 2.11531 9.82946C2.34683 8.66557 2.91827 7.59647 3.75739 6.75736C4.5965 5.91824 5.6656 5.3468 6.82948 5.11529C7.99337 4.88378 9.19977 5.0026 10.2961 5.45672C11.3925 5.91085 12.3296 6.67988 12.9888 7.66658C13.6481 8.65327 14 9.81331 14 11C14 12.5913 13.3679 14.1174 12.2427 15.2426C11.1174 16.3679 9.59133 17 8.00003 17ZM6.00003 2H10C10.2652 2 10.5196 1.89464 10.7071 1.70711C10.8947 1.51957 11 1.26522 11 1C11 0.734784 10.8947 0.48043 10.7071 0.292893C10.5196 0.105357 10.2652 0 10 0H6.00003C5.73481 0 5.48046 0.105357 5.29292 0.292893C5.10538 0.48043 5.00003 0.734784 5.00003 1C5.00003 1.26522 5.10538 1.51957 5.29292 1.70711C5.48046 1.89464 5.73481 2 6.00003 2ZM9.00003 8C9.00003 7.73478 8.89467 7.48043 8.70713 7.29289C8.5196 7.10536 8.26524 7 8.00003 7C7.73481 7 7.48046 7.10536 7.29292 7.29289C7.10538 7.48043 7.00003 7.73478 7.00003 8V9.89C6.7736 10.0925 6.614 10.359 6.54235 10.6542C6.47069 10.9495 6.49037 11.2595 6.59877 11.5433C6.70717 11.8271 6.89918 12.0712 7.14939 12.2435C7.39961 12.4158 7.69624 12.508 8.00003 12.508C8.30381 12.508 8.60044 12.4158 8.85066 12.2435C9.10088 12.0712 9.29289 11.8271 9.40129 11.5433C9.50968 11.2595 9.52936 10.9495 9.45771 10.6542C9.38606 10.359 9.22646 10.0925 9.00003 9.89V8Z"
                  fill="black"
                />
              </svg>
              <span className="text-[#cb1206] font-semibold text-lg">
                {timeRemaining}
              </span>
            </div>
          </div>
          <p className="text-white bg-[#7765DA]/90 rounded-md px-2 py-1 font-semibold">
            You: {userName}
          </p>
        </div>

        <div className="mt-2.5 flex flex-col items-end">
          <div className="w-181.75 rounded-[9px] border border-[#af8ff1]">
            <div className="w-181.75 min-h-12.5 pl-4 rounded-t-[10px] bg-linear-to-r from-[#343434] to-[#6e6e6e] flex items-center">
              <p className="font-semibold text-[17px] text-white">
                {currentPoll.question}
              </p>
            </div>

            {results && (
              <div className="mt-4.5 px-4 py-4.5 flex flex-col gap-3.75">
                {results.map((option, index) => {
                  if (option.id === selectedOptionId) {
                    return (
                      <div
                        key={option.id}
                        className="w-full rounded-md px-5.75 py-4 border-[1.5px] border-[#8f64e1] flex items-center gap-2.5 justify-between relative overflow-hidden"
                        style={{
                          background: `linear-gradient(to right, #8f64e1 ${option.percentage}%, #f6f6f6 ${option.percentage}%)`,
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full border border-[#8f64e1] bg-[#f2f2f2] flex justify-center items-center text-[#8f64e1] font-semibold text-[11px] leading-none">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="font-normal text-[18px] leading-none text-[#000000] ">
                            {option.text}
                          </span>
                        </div>
                        <span className="text-[18px] font-semibold">
                          {option.percentage}%
                        </span>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={option.id}
                        className="w-full rounded-md px-5.75 py-4 border  border-[#8D8D8D30] flex items-center gap-2.5 justify-between relative overflow-hidden"
                        style={{
                          background: `linear-gradient(to right, #8f64e1 ${option.percentage}%, #f6f6f6 ${option.percentage}%)`,
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full border border-[#8f64e1] bg-[#f2f2f2] flex justify-center items-center text-[#8f64e1] font-semibold text-[11px] leading-none">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="font-normal text-[18px] leading-none text-[#000000] ">
                            {option.text}
                          </span>
                        </div>
                        <span className="text-[18px] font-semibold">
                          {option.percentage}%
                        </span>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-[18px] font-semibold">Your Answer</div>
        <div className="mt-1 w-full rounded-md px-5.75 py-4 border  border-[#8D8D8D30] bg-[#f9f9f9]">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full border border-[#8f64e1] bg-[#f2f2f2] flex justify-center items-center text-[#8f64e1] font-semibold text-[11px] leading-none">
              {String.fromCharCode(
                65 + currentPoll.options.findIndex((opt) => opt.id === myAnswer)
              )}
            </span>
            <span className="font-normal text-[18px] leading-none text-[#000000] ">
              {currentPoll.options.find((opt) => opt.id === myAnswer)?.text}
            </span>
          </div>
        </div>

        <div className="text-[24px] font-semibold mt-12.5 text-center">
          Wait for the teacher to ask a new question..
        </div>
      </div>

      <ChatPopup />
    </div>
  );
}

const WaitMessage = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center flex-col p-4">
      <div className="w-33.5 h-7.75  rounded-3xl px-2.25 flex justify-center items-center gap-1.75 bg-linear-to-r from-[#7565d9] to-[#4d0acd]">
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
        <span className="text-sm font-semibold text-white">Intervue Poll</span>
      </div>

      <div className="mt-12.5">
        <div className="w-10 h-10 border-4 border-[#f3f3f3] border-t-[#500ece] border-r-[#500ece] border-b-[#500ece] rounded-full animate-spin"></div>
      </div>

      <div className="mt-12.5">
        <div className="w-165 text-[33px] font-semibold leading-none text-center text-black">
          Wait for the teacher to ask questions..
        </div>
      </div>
    </div>
  );
};

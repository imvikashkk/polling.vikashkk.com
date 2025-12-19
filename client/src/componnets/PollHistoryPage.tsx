'use client';

import { useAppSelector } from '@/store';
import { selectPollHistory } from '@/store/slices/pollSlice';
import { ChatPopup } from './shared/ChatPopup';

export const PollHistoryPage = () => {
  const history = useAppSelector(selectPollHistory);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center flex-col p-4">
      <div className="mt-7.5 w-full ml-190">
        <h1 className="font-normal text-[40px]  text-black text-left">
          {`View `}
          <span className=" font-semibold text-[40px]  text-left">
            Poll History
          </span>
        </h1>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-6 bg-gray-100 rounded-full mb-4">
              <span className="text-5xl">📊</span>
            </div>
            <p className="text-xl font-medium text-gray-600">No polls yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Your poll history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {history.map((poll, pollIndex) => {
              const totalVotes = poll.totalVotes;
              return (
                <div key={poll.pollId}>
                  <div>
                    <h2 className="text-[22px] font-semibold leading-[90%]">
                      Question {history.length - pollIndex}
                    </h2>
                    <p>{new Date(poll.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="mt-5 w-181.75 rounded-[9px] border border-[#af8ff1]">
                    <div className="w-181.75 min-h-12.5 pl-4 rounded-t-[10px] bg-linear-to-r from-[#343434] to-[#6e6e6e] flex items-center">
                      <p className="font-semibold text-[17px] text-white">
                        {poll.question} - {totalVotes}
                      </p>
                    </div>
                    <div className="p-4 space-y-3">
                      {poll.options.map((option, index) => {
                        const percentage =
                          totalVotes > 0
                            ? Math.round((option.votes / totalVotes) * 100)
                            : 0;
                        return (
                          <>
                            <div
                              className="w-full rounded-md px-5.75 py-4 border-[1.5px] border-[#6766D5] flex items-center gap-2.5 justify-between relative overflow-hidden"
                              style={{
                                background: `linear-gradient(to right, #6766D5 ${percentage}%, #f6f6f6 ${percentage}%)`,
                              }}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-full border border-[#6766D5] bg-[#f2f2f2] flex justify-center items-center text-[#6766D5] font-semibold text-[11px] leading-none">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <span className="font-normal text-[18px] leading-none text-[#000000] ">
                                  {option.text}
                                </span>
                              </div>
                              <span className="text-[18px] font-semibold">
                                {percentage}%
                              </span>
                            </div>
                          </>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ChatPopup />
    </div>
  );
};

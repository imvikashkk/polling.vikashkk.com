'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { useSocketActions } from '@/hooks/useSocketAction';
import {
  selectMessages,
  selectIsChatOpen,
  selectUnreadCount,
  toggleChat,
  clearUnreadCount,
} from '@/store/slices/chatSlice';
import { selectUserName, selectUserRole } from '@/store/slices/userSlice';
import { StudentsList } from '../teacher/StudentList';
import { selectStudents } from '@/store/slices/sessionSlice';

export const ChatPopup: React.FC = () => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const { sendMessage } = useSocketActions();

  const messages = useAppSelector(selectMessages);
  const isOpen = useAppSelector(selectIsChatOpen);
  const unreadCount = useAppSelector(selectUnreadCount);
  const userName = useAppSelector(selectUserName);
  const userRole = useAppSelector(selectUserRole);
  const students = useAppSelector(selectStudents);

  /* Mera */
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');

  /* Auto-scroll to bottom when new message */
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  /* Focus input when chat opens */
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      dispatch(clearUnreadCount());
    }
  }, [isOpen, dispatch]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleToggle = () => {
    dispatch(toggleChat());
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={handleToggle}
        className="w-20 h-20 px-5 py-4.75 bg-[#5A66D1] rounded-[50%] fixed bottom-6 right-6 shadow-lg flex items-center justify-center hover:bg-[#4e57c9] transition-colors z-30"
      >
        <svg
          width="33"
          height="33"
          viewBox="0 0 33 33"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[32.5px] h-[32.5px] text-[#ffffff] ml-0.5 mt-0.5"
        >
          <path
            d="M27.625 0H4.875C3.58207 0 2.34209 0.513615 1.42785 1.42785C0.513615 2.34209 0 3.58207 0 4.875V21.125C0 22.4179 0.513615 23.6579 1.42785 24.5721C2.34209 25.4864 3.58207 26 4.875 26H23.7087L29.7213 32.0288C29.8731 32.1794 30.0532 32.2985 30.2512 32.3794C30.4491 32.4603 30.6611 32.5012 30.875 32.5C31.0882 32.5055 31.2996 32.461 31.4925 32.37C31.7893 32.2481 32.0433 32.0411 32.2226 31.775C32.4019 31.509 32.4984 31.1958 32.5 30.875V4.875C32.5 3.58207 31.9864 2.34209 31.0721 1.42785C30.1579 0.513615 28.9179 0 27.625 0ZM29.25 26.9588L25.5287 23.2213C25.3769 23.0706 25.1968 22.9515 24.9988 22.8706C24.8009 22.7898 24.5889 22.7488 24.375 22.75H4.875C4.44402 22.75 4.0307 22.5788 3.72595 22.274C3.42121 21.9693 3.25 21.556 3.25 21.125V4.875C3.25 4.44402 3.42121 4.0307 3.72595 3.72595C4.0307 3.42121 4.44402 3.25 4.875 3.25H27.625C28.056 3.25 28.4693 3.42121 28.774 3.72595C29.0788 4.0307 29.25 4.44402 29.25 4.875V26.9588Z"
            fill="white"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Window */}
      {isOpen && (
        <div className="fixed bottom-28 bg-white right-6  w-107.25 h-119.25 rounded-sm border border-[#CECECE] shadow-[4px_4px_10px_0px_#00000040,4px_4px_20px_0px_#0000000A] z-30">
          {/* Tab Selector */}
          <div className="w-full flex justify-between border-b border-b-[#CECECE] ">
            <div className="px-6 py-2.5 flex items-center gap-5">
              <span
                onClick={() => setActiveTab('chat')}
                className={
                  (activeTab === 'chat' ? 'font-bold ' : ' ') +
                  'relative cursor-pointer'
                }
              >
                Chat
                {activeTab === 'chat' && (
                  <span className="absolute -bottom-3 min-h-1 w-12 rounded-xs bg-[#8F64E1] z-10 -left-1.25 "></span>
                )}
              </span>
              {userRole === 'teacher' && (
                <span
                  onClick={() => setActiveTab('participants')}
                  className={
                    (activeTab === 'participants' ? 'font-bold ' : ' ') +
                    'relative cursor-pointer'
                  }
                >
                  Participants
                  {activeTab === 'participants' && (
                    <span className="absolute -bottom-3 min-h-1 w-26 rounded-xs bg-[#8F64E1] z-10 -left-1.25 "></span>
                  )}
                </span>
              )}
            </div>
            {userRole === 'teacher' && (
              <span className=" bg-[#4F0DCE] h-11.25 min-w-35 rounded-tr-sm flex gap-4 px-3 items-center text-[#f2f2f2] font-semibold">
                Students{' '}
                <span className="px-2 py-1 rounded-full bg-[#7765DA]">
                  {students.length}
                </span>
              </span>
            )}
          </div>
          {/* Chat Tab */}

          {activeTab === 'chat' && (
            <>
              <div className="flex-1 h-88.75 overflow-y-auto p-4 space-y-3 ">
                {messages.length === 0 ? (
                  <div className="flex flex-col h-full items-center justify-center text-gray-500">
                    <span className="text-4xl mb-2">💬</span>
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderName === userName;
                    const isTeacher = msg.senderRole === 'teacher';

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            isMe
                              ? 'bg-[#5767D0] text-white rounded-br-none'
                              : isTeacher
                              ? 'bg-[#7765DA] text-[#ffffff] rounded-bl-none'
                              : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                          }`}
                        >
                          {!isMe && (
                            <div className="flex items-center gap-1 mb-1">
                              <p
                                className={
                                  `text-xs font-bold ` +
                                  (isTeacher
                                    ? 'text-[#f9f9f9]'
                                    : 'text-[#6E6E6E]')
                                }
                              >
                                {msg.senderName}
                              </p>
                            </div>
                          )}
                          <p className="text-sm wrap-break-word">
                            {msg.message}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isMe
                                ? 'text-blue-100'
                                : isTeacher
                                ? 'text-[#f2f2f2]'
                                : 'text-gray-500'
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className=" p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5767D0] focus:border-transparent"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="px-4 py-2 bg-[#5767D0] text-white rounded-lg hover:bg-[#4756b8] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <span>Send</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}

          {userRole === 'teacher' && activeTab === 'participants' && (
            <StudentsList students={students} />
          )}
        </div>
      )}
    </>
  );
};

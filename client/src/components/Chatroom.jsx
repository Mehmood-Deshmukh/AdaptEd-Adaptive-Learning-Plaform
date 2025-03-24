import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthContext from '../hooks/useAuthContext';
import { MessageSquare, X, Users, Send } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ChatRoom = ({ communityId, communityName, isOpen, onClose }) => {
  const { state } = useAuthContext();
  const { user } = state;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [onlineUsersList, setOnlineUsersList] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const inputRef = useRef(null);
  
  const userAvatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}`;

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toISOString().replace('T', ' ').substring(0, 19);
      setCurrentDateTime(formatted);
    };
    
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarUrl = (userName) => {
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userName)}`;
  };

  useEffect(() => {
    if (!isOpen) return;
    
    const channelName = `chat-room-${communityId}`;
    
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: user._id },
      },
    });

    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        console.log('Received message:', payload);
        setMessages((prev) => [...prev, payload.message]);
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== user._id) {
          setTypingUsers((prev) => {
            if (!prev.includes(payload.userName)) {
              return [...prev, payload.userName];
            }
            return prev;
          });

          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== payload.userName));
          }, 3000);
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence state:', state);
        
        const users = [];
        Object.values(state).forEach(presences => {
          presences.forEach(presence => {
            if (presence.userName && presence.userId) {
              users.push({
                id: presence.userId,
                name: presence.userName,
                avatar: getAvatarUrl(presence.userName),
                online_at: presence.online_at
              });
            }
          });
        });
        
        setOnlineUsers(users.length);
        setOnlineUsersList(users);
      })
      .subscribe((status) => {
        console.log('Channel subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          channel.track({ 
            userId: user._id, 
            userName: user.name,
            online_at: new Date().toISOString() 
          });
        }
      });

    channelRef.current = channel;

    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => {
      console.log('Unsubscribing from channel');
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [isOpen, communityId, user._id, user.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const typingTimeoutRef = useRef(null);

  const handleTyping = () => {
    if (!channelRef.current) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { 
        userId: user._id,
        userName: user.name
      },
    });

    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 3000);
  };

  const handleSendMessage = () => {
    if (!channelRef.current || newMessage.trim() === '') return;

    const timestamp = new Date().toISOString();

    channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: {
        message: {
          userId: user._id,
          userName: user.name,
          content: newMessage,
          timestamp: timestamp,
        },
      },
    });

    setNewMessage('');
    console.log('Message sent');
  };

  const chatVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 } 
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      transition: { duration: 0.2 } 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose(false)}
        >
          <motion.div
            className="w-[800px] h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} 
          >
        
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <h2 className="font-bold text-lg">{communityName} Chat</h2>
                <div className="flex items-center bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-1"></div>
                  <span className='text-black'>{onlineUsers} online</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-300">{currentDateTime || '2025-03-24 04:26:14'}</div>
                <button
                  onClick={() => onClose(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 flex flex-col">
  
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare size={40} className="text-gray-300 mb-2" />
                      <p className="text-gray-500">No messages yet in this community.</p>
                      <p className="text-gray-400 text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`mb-4 ${
                          msg.userId === user._id ? 'flex flex-col items-end' : 'flex flex-col items-start'
                        }`}
                      >
                        <div className={`flex items-center mb-1 ${
                          msg.userId === user._id ? 'justify-end' : ''
                        }`}>
                          {msg.userId !== user._id && (
                            <img 
                              src={getAvatarUrl(msg.userName)} 
                              alt={msg.userName}
                              className="w-8 h-8 rounded-full mr-2" 
                            />
                          )}
                          <span className="font-semibold text-sm text-gray-700">
                            {msg.userId === user._id ? 'You' : msg.userName}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <div 
                          className={`p-3 rounded-lg max-w-[75%] inline-block ${
                            msg.userId === user._id 
                              ? 'bg-black text-white rounded-tr-none' 
                              : 'bg-gray-200 text-black rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}

                  {typingUsers.length > 0 && (
                    <div className="text-gray-500 text-sm mb-2">
                      {typingUsers.length === 1
                        ? `${typingUsers[0]} is typing...`
                        : `${typingUsers.length} people are typing...`}
                      <div className="inline-flex ml-1">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="px-4 py-3 border-t border-gray-200 bg-white">
                  <div className="flex items-center">
                    <img 
                      src={userAvatarUrl} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full mr-3" 
                    />
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={`Message ${communityName}...`}
                      className="flex-1 py-2 px-4 bg-gray-100 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={newMessage.trim() === ''}
                      className={`ml-3 p-2 rounded-full ${newMessage.trim() === '' ? 'text-gray-400' : 'text-black hover:bg-gray-100'}`}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-64 bg-gray-100 border-l border-gray-200 p-4 overflow-y-auto flex flex-col">
                <div className="flex items-center mb-4">
                  <Users size={18} className="text-gray-500 mr-2" />
                  <h3 className="font-semibold text-gray-700">Online Users ({onlineUsers})</h3>
                </div>
                
                {onlineUsersList.length > 0 ? (
                  <div className="space-y-3">
                    {onlineUsersList.map((onlineUser) => (
                      <div key={onlineUser.id} className="flex items-center">
                        <div className="relative">
                          <img 
                            src={onlineUser.avatar} 
                            alt={onlineUser.name}
                            className="w-10 h-10 rounded-full" 
                          />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                            {onlineUser.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {onlineUser.id === user._id ? 'You' : 'Active'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No one is online</p>
                )}
                
                <div className="mt-auto">
                  <div className="bg-gray-200 rounded-lg p-3 text-xs text-gray-600">
                    <p className="font-semibold mb-1">Your Status</p>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>Online as {user.name || 'Mehmood-Deshmukh'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <style jsx="true">{`
              .typing-dot {
                display: inline-block;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background-color: #888;
                margin: 0 1px;
                animation: typingAnimation 1.4s infinite ease-in-out both;
              }
              
              .typing-dot:nth-child(1) {
                animation-delay: 0s;
              }
              
              .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
              }
              
              .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
              }
              
              @keyframes typingAnimation {
                0%, 80%, 100% { 
                  transform: scale(0.6);
                  opacity: 0.6;
                }
                40% { 
                  transform: scale(1);
                  opacity: 1;
                }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatRoom;
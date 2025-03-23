import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import useAuthContext from '../hooks/useAuthContext';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ChatRoom = () => {
  const { state } = useAuthContext();
  const { user } = state;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {

    const channel = supabase.channel('chat-room', {
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
        console.log('User typing:', payload);
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
        

        const userList = Object.values(state).flat();
        setOnlineUsers(userList.length);
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

    return () => {
      console.log('Unsubscribing from channel');
      channel.unsubscribe();
    };
  }, [user._id, user.name]);


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

    channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: {
        message: {
          userId: user._id,
          userName: user.name,
          content: newMessage,
          timestamp: new Date().toISOString(),
        },
      },
    });

    setNewMessage('');
    console.log('Message sent');
  };

  return (
    <div className="bg-white text-black h-screen flex flex-col">
      
      <div className="bg-black text-white p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Chat Room</h2>
        <div className="flex items-center">
          <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
            <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
            <span className="text-sm text-black">{onlineUsers} online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 max-w-[80%] ${
                msg.userId === user._id ? 'ml-auto' : ''
              }`}
            >
              <div className="flex items-center mb-1">
                <span className={`font-semibold ${
                  msg.userId === user._id ? 'text-black' : 'text-gray-700'
                }`}>
                  {msg.userId === user._id ? 'You' : msg.userName}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div 
                className={`p-3 rounded-lg ${
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

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center">
          <input
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
            placeholder="Type a message..."
            className="flex-1 py-3 px-4 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ''}
            className="py-3 px-5 bg-black text-white rounded-r-lg hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>

      <style jsx>{`
        .typing-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
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
    </div>
  );
};

export default ChatRoom;
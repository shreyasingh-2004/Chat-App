import { useState, useEffect } from 'react';
import useSendMessage from './useSendMessage';

const useMessageQueue = () => {
  const [messageQueue, setMessageQueue] = useState([]);
  const { sendMessage } = useSendMessage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Send queued messages when back online
      messageQueue.forEach(msg => sendMessage(msg));
      setMessageQueue([]);
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [messageQueue]);

  const sendWithQueue = async (messageData) => {
    if (isOnline) {
      await sendMessage(messageData);
    } else {
      setMessageQueue(prev => [...prev, messageData]);
      alert('You are offline. Message will send when connection returns.');
    }
  };

  return { sendWithQueue, queuedCount: messageQueue.length };
};
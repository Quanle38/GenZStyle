/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo } from 'react';
import { notification } from 'antd';

interface NotificationContextType {
  notify: (message : string, description ?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();

  const notify = ( message : string, description ?: string) => {
    api.info({
      message ,
      description : description ? description : " ",
      placement : 'topRight',
      duration : 3,
    });
  };

  const value = useMemo(() => ({ notify }), [api]);

  return (
    <NotificationContext.Provider value={value}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used inside NotificationProvider');
  }
  return context;
};
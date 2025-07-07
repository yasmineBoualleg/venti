import React from 'react';
import { useLoading } from '../context/LoadingContext';

export const loadingController: { show: () => void; hide: () => void } = {
  show: () => {},
  hide: () => {},
};

export function useApiLoadingController() {
  const { showLoading, hideLoading } = useLoading();
  React.useEffect(() => {
    loadingController.show = showLoading;
    loadingController.hide = hideLoading;
  }, [showLoading, hideLoading]);
} 
import React from 'react';
import { useApiLoadingController } from './useApiLoadingController';

const ApiLoadingControllerBridge: React.FC = () => {
  useApiLoadingController();
  return null;
};

export default ApiLoadingControllerBridge; 
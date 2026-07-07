import { createDeviceBridgeFacade } from './deviceBridgeFacade.js';

let sharedDeviceBridgeFacade = null;

export function getSharedDeviceBridgeFacade() {
  if (!sharedDeviceBridgeFacade) {
    sharedDeviceBridgeFacade = createDeviceBridgeFacade();
  }
  return sharedDeviceBridgeFacade;
}

export function resetSharedDeviceBridgeFacadeForTests() {
  sharedDeviceBridgeFacade = null;
  return getSharedDeviceBridgeFacade();
}

import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

import type { Connectivity } from '@/core/connectivity/Connectivity';

/** isInternetReachable es null mientras NetInfo lo averigua: solo un false explícito es "sin red". */
function online(state: NetInfoState): boolean {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

export class NetInfoConnectivity implements Connectivity {
  async isOnline(): Promise<boolean> {
    return online(await NetInfo.fetch());
  }

  onReconnect(listener: () => void): () => void {
    let wasOnline = true;
    return NetInfo.addEventListener((state) => {
      const isOnline = online(state);
      if (isOnline && !wasOnline) listener();
      wasOnline = isOnline;
    });
  }
}

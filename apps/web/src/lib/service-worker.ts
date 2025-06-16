// Post a message to the service worker
export async function postMessageToServiceWorker<
  TResponsePayload,
  TRequestPayload = undefined
>(type: string, data?: TRequestPayload): Promise<TResponsePayload> {
  if (!navigator.serviceWorker.controller) {
    return Promise.reject(
      new Error("No active service worker to post message to.")
    );
  }

  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data.payload as TResponsePayload);
      }
    };

    navigator.serviceWorker.controller!.postMessage({ type, data }, [
      messageChannel.port2,
    ]);
  });
}

const CHANNEL_NAME = 'divine-bloom-bridge';

export class WindowBridge {
  constructor(windowId, onMessage) {
    this.windowId = windowId;
    this.channel = new BroadcastChannel(CHANNEL_NAME);
    this.channel.onmessage = (event) => {
      const { targetId, sourceId, type, payload } = event.data;
      // 如果指定了 targetId，则只有目标窗口响应；否则所有窗口响应（广播）
      if (!targetId || targetId === this.windowId) {
        if (onMessage) onMessage({ sourceId, type, payload });
      }
    };
  }

  send(type, payload, targetId = null) {
    this.channel.postMessage({
      sourceId: this.windowId,
      targetId,
      type,
      payload
    });
  }

  close() {
    this.channel.close();
  }
}

import DOMPurify from "dompurify";
class Message {
  constructor(messageId, from, content, sentTime, isUnsent = false) {
    this.messageId = messageId;
    this.from = from;
    this.content = this.getSafeContent(content);
    this.sentTime = new Date(sentTime).toLocaleString("zh-TW", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    this.isUnsent = isUnsent;
  }

  getSafeContent(content) {
    return DOMPurify.sanitize(content);
  }

  formatDate(sentTime) {
    const sentDate = new Date(sentTime);
    const now = new Date();
    let options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };

    if (sentDate.toDateString() === now.toDateString()) {
      return sentDate.toLocaleTimeString("zh-TW", options);
    }

    if (sentDate.getFullYear() === now.getFullYear()) {
      options.month = "long";
      options.day = "numeric";
    } else {
      options.year = "numeric";
      options.month = "long";
      options.day = "numeric";
    }

    return sentDate.toLocaleString("zh-TW", options);
  }

  unsend() {
    this.isUnsent = true;
  }
}

export default Message;

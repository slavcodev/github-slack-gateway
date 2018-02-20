"use strict";

/**
 * Slack.
 */
class Slack {
  /**
     * @param httpClient
     * @param appName
     * @param appIcon
     */
  constructor (httpClient, appName, appIcon) {
    this.httpClient = httpClient;
    this.appName = appName;
    this.appIcon = appIcon || ":stuck_out_tongue_winking_eye:";
    this.defaultAttachmentColor = "good";
  }

  /**
     * @param message
     */
  send (message) {
    this.httpClient.send(message);
  }

  /**
     * @returns {Message}
     */
  createMessage () {
    const message = new Message();

    if (this.appName) {
      message.setAppName(this.appName, this.appIcon);
    }

    return message;
  }

  /**
     * @returns {Attachment}
     */
  createAttachment () {
    const attachment = new Attachment();
    attachment.setColor(this.defaultAttachmentColor);

    return attachment;
  }
}

/**
 * JsonSerializable.
 */
class JsonSerializable {
  /**
     * @returns {string}
     */
  toString () {
    return JSON.stringify(this, null, " ");
  }
}

/**
 * Attachment.
 */
class Attachment extends JsonSerializable {
  /**
     * @param color
     * @returns {Attachment}
     */
  setColor (color) {
    this["color"] = color;

    return this;
  }

  /**
     * @param name
     * @param link
     * @param icon
     * @returns {Attachment}
     */
  setAuthor (name, link, icon) {
    this["author_name"] = name;
    this["author_link"] = link;
    this["author_icon"] = icon;

    return this;
  }

  /**
     * @param text
     * @param fallback
     * @returns {Attachment}
     */
  setText (text, fallback) {
    this["text"] = text;
    this["fallback"] = fallback;

    return this;
  }
}

/**
 * Message.
 */
class Message extends JsonSerializable {
  /**
     * Constructor.
     */
  constructor () {
    super();
    this["link_names"] = 1;
  }

  /**
     * @param appName
     * @param appIcon
     * @returns {Message}
     */
  setAppName (appName, appIcon) {
    this["username"] = appName;
    this["icon_emoji"] = appIcon;

    return this;
  }

  /**
     * @param attachment
     * @returns {Message}
     */
  addAttachment (attachment) {
    if (!this["attachments"]) {
      this["attachments"] = [];
    }

    this["attachments"].push(attachment);

    return this;
  }

  /**
     * @param channel
     * @returns {Message}
     */
  setChannel (channel) {
    this["channel"] = channel;

    return this;
  }
}

module.exports = Slack;

import fs from "node:fs"

const files = [
  "/app/node_modules/@elizaos/core/dist/node/index.node.js",
  "/app/node_modules/@elizaos/core/dist/browser/index.browser.js",
]

const matrixPluginFile = "/app/node_modules/@elizaos/plugin-matrix/dist/index.js"

const replacements = [
  {
    from: "const value = secrets?.[key] || settings?.[key] || nestedSecrets?.[key] || this.settings[key];",
    to: "const value = secrets?.[key] || settings?.[key] || nestedSecrets?.[key] || (typeof process !== \"undefined\" ? process.env?.[key] : undefined) || this.settings[key];",
  },
]

let patched = 0

for (const file of files) {
  if (!fs.existsSync(file)) continue
  let source = fs.readFileSync(file, "utf8")
  let changed = false
  for (const { from, to } of replacements) {
    if (!source.includes(from)) continue
    source = source.replace(from, to)
    changed = true
  }
  if (changed) {
    fs.writeFileSync(file, source)
    patched += 1
  }
}

if (patched === 0) {
  throw new Error("Eliza runtime settings patch target not found")
}

if (!fs.existsSync(matrixPluginFile)) {
  throw new Error("Matrix plugin dist file not found")
}

let matrixSource = fs.readFileSync(matrixPluginFile, "utf8")

// Patch: Add debug logging to Timeline handler
const timelineNeedle = `    this.client.on(sdk.RoomEvent.Timeline, (event, room, toStartOfTimeline) => {
      if (toStartOfTimeline)
        return;
      if (event.getType() !== "m.room.message")
        return;
      if (event.getSender() === this.settings.userId)
        return;
      this.handleRoomMessage(event, room);
    });`

const timelinePatch = `    let _syncReady = false;
    this.client.on(sdk.ClientEvent.Sync, (state) => {
      if (state === "PREPARED" && !_syncReady) {
        _syncReady = true;
        logger.info("[MATRIX-PATCH] Sync ready, now processing live messages");
      }
    });
    this.client.on(sdk.RoomEvent.Timeline, (event, room, toStartOfTimeline) => {
      if (toStartOfTimeline)
        return;
      if (!_syncReady) {
        return;
      }
      if (event.getType() !== "m.room.message")
        return;
      if (event.getSender() === this.settings.userId)
        return;
      logger.info(\`[MATRIX-PATCH] Live message from \${event.getSender()} in \${event.getRoomId()}\`);
      this.handleRoomMessage(event, room);
    });`

if (!matrixSource.includes(timelineNeedle)) {
  throw new Error("Timeline handler patch target not found")
}
matrixSource = matrixSource.replace(timelineNeedle, timelinePatch)

const matrixNeedle = `    this.runtime.emitEvent("MATRIX_MESSAGE_RECEIVED" /* MESSAGE_RECEIVED */, {
      message,
      room: matrixRoom,
      runtime: this.runtime
    });`

const matrixPatch = [
  '    const messageService = this.runtime.messageService;',
  '    if (messageService?.handleMessage) {',
  '      (async () => {',
  '        try {',
  '          const { createUniqueUuid } = await import("@elizaos/core");',
  '          const entityUuid = createUniqueUuid(this.runtime, sender || roomId);',
  '          const roomUuid = createUniqueUuid(this.runtime, roomId);',
  '          const worldUuid = createUniqueUuid(this.runtime, "matrix-world");',
  '          await this.runtime.ensureConnection({',
  '            entityId: entityUuid,',
  '            roomId: roomUuid,',
  '            worldId: worldUuid,',
  '            worldName: "Matrix",',
  '            userName: senderInfo.displayName || sender || "",',
  '            name: matrixRoom.name || roomId,',
  '            source: "matrix",',
  '            type: "GROUP",',
  '            channelId: roomId,',
  '            userId: sender || "",',
  '          });',
  '          const incomingMemory = {',
  '            id: crypto.randomUUID(),',
  '            entityId: entityUuid,',
  '            agentId: this.runtime.agentId,',
  '            roomId: roomUuid,',
  '            createdAt: event.getTs(),',
  '            content: {',
  '              text: content.body || "",',
  '              source: "matrix",',
  '              channelType: "GROUP"',
  '            },',
  '            metadata: {',
  '              senderId: sender || "",',
  '              senderName: senderInfo.displayName || sender || "",',
  '              matrixRoom,',
  '              senderInfo',
  '            }',
  '          };',
  '          const callback = async (responseContent) => {',
  '            if (!responseContent?.text) {',
  '              return [];',
  '            }',
  '            await this.sendMessage(responseContent.text, {',
  '              roomId,',
  '              replyTo: message.eventId',
  '            });',
  '            return [];',
  '          };',
  '          await messageService.handleMessage(this.runtime, incomingMemory, callback);',
  '        } catch (err) {',
  '          logger.error("Failed to handle Matrix message: " + err.message);',
  '        }',
  '      })();',
  '      return;',
  '    }',
  '    this.runtime.emitEvent("MATRIX_MESSAGE_RECEIVED" /* MESSAGE_RECEIVED */, {',
  '      message,',
  '      room: matrixRoom,',
  '      runtime: this.runtime',
  '    });',
].join("\n")

if (!matrixSource.includes(matrixNeedle)) {
  throw new Error("Matrix message handling patch target not found")
}

matrixSource = matrixSource.replace(matrixNeedle, matrixPatch)

const initNeedle = `    if (requireMention === "true") {
      logger2.info("  Require Mention: ✓ Enabled (will only respond to mentions in rooms)");
    }
  }
};`

const initPatch = [
  '    if (requireMention === "true") {',
  '      logger2.info("  Require Mention: ✓ Enabled (will only respond to mentions in rooms)");',
  '    }',
  '    const matrixService = runtime.getService(MATRIX_SERVICE_NAME);',
  '    if (matrixService?.sendMessage) {',
  '      runtime.registerSendHandler("matrix", async (_runtime, target, content) => {',
  '        if (!target?.roomId || !content?.text) {',
  '          return;',
  '        }',
  '        await matrixService.sendMessage(content.text, {',
  '          roomId: target.roomId,',
  '          replyTo: content.inReplyTo',
  '        });',
  '      });',
  '    }',
  '  }',
  '};',
].join("\n")

if (!matrixSource.includes(initNeedle)) {
  throw new Error("Matrix init patch target not found")
}

matrixSource = matrixSource.replace(initNeedle, initPatch)
fs.writeFileSync(matrixPluginFile, matrixSource)

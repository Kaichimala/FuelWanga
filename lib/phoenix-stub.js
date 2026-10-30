// Stub for @supabase/phoenix.
// This app does not use Supabase Realtime or Presence.
// The stub satisfies the import so the build and runtime don't break.

export class Socket {
  constructor() {}
  connect() {}
  disconnect() {}
  channel() { return new Channel(); }
  onOpen() {}
  onClose() {}
  onError() {}
}

export class Channel {
  constructor() {}
  join() { return this; }
  leave() { return this; }
  on() { return this; }
  off() {}
  push() { return this; }
  receive() { return this; }
  onClose() {}
  onError() {}
}

export class Presence {
  constructor() {}
  onSync() {}
  onJoin() {}
  onLeave() {}
  list() { return []; }
  static syncState() { return {}; }
  static syncDiff() { return {}; }
  static list() { return []; }
}

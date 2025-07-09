// how would you make this concurrent safe?

export type Room = {
  name: string;
  messages: {
    content: string;
    createdAt: Date;
  }[];
};

export class RoomManager {
  private rooms = new Map<string, Room>();

  createRoom(name: string) {
    const slug = name
      .trim()
      .toLowerCase()
      .replaceAll(" ", "-")
      .replace(/[^a-z0-9-]/g, "");
    if (this.rooms.has(slug)) {
      throw new Error("Room already exists");
    }
    this.rooms.set(slug, {
      name: slug,
      messages: [],
    });
    return slug;
  }

  getRoom(name: string) {
    return this.rooms.get(name);
  }

  addMessage(name: string, message: string) {
    const room = this.getRoom(name);
    if (!room) {
      throw new Error("Room not found");
    }
    room.messages.push({
      content: message,
      createdAt: new Date(),
    });
  }
}

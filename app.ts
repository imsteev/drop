import { Hono } from "hono";
import { RoomManager } from "./lib/rooms";

const rooms = new RoomManager();

const app = new Hono();

app.get("/", (c) =>
  c.html(
    ContainerHtml(`<main>
    <h1>Drop</h1>
      <form action="/rooms" method="post">
        <input type="text" name="name" />
        <button type="submit">Create Room</button>
      </form>
    </main>`)
  )
);

app.post("/rooms", async (c) => {
  const form = await c.req.formData();
  const name = form.get("name");
  if (!name) {
    return c.html(
      ContainerHtml(`<main>
        <h1>Name is required</h1>
        <form action="/rooms" method="post"><input type="text" name="name" />
          <input type="hidden" name="room" value="${name}" />
          <button type="submit">Create Room</button></form>
        </main>`)
    );
  }
  const slug = rooms.createRoom(name as string);
  return c.redirect(`/rooms/${slug}`);
});

app.get("/rooms/:slug", (c) => {
  const room = rooms.getRoom(c.req.param("slug"));
  if (!room) {
    return c.html(
      ContainerHtml(
        `<main><h1>Room not found</h1><a href="/">Go back</a></main>`
      )
    );
  }
  return c.html(
    ContainerHtml(`<main>
      <h1>Room: ${room.name}</h1>
      <form action="/rooms/${room.name}/messages" method="post">
      <input type="text" name="message" />
      <button type="submit">Create Message</button>
      <input type="hidden" name="room" value="${room.name}" />
      </form>
      <div id="messages">
        ${room.messages
          .toReversed()
          .map((message) => `<p>${message.content}</p>`)
          .join("")}
      </div>
    </main>`)
  );
});

app.get("/rooms", (c) => c.redirect("/"));

app.post("/rooms/:slug/messages", async (c) => {
  const form = await c.req.formData();
  const room = rooms.getRoom(c.req.param("slug"));
  if (!room) {
    return c.html(
      ContainerHtml(`<main>
        <h1>Room not found</h1>
        <a href="/">Go back</a>
      </main>`)
    );
  }
  const message = form.get("message");
  if (!message) {
    return c.html(
      ContainerHtml(`<main>
        <h1>Message is required</h1>
        <a href="/">Go back</a>
      </main>`)
    );
  }
  rooms.addMessage(room.name, message as string);
  return c.redirect(`/rooms/${room.name}`);
});

export default {
  port: 3000,
  fetch: app.fetch,
};

const ContainerHtml = (html: string) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Drop</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
    }
  </style>
  </head>
  <body>
  ${html}
  </body>
  </html>
  `;
};

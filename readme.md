# DM Relay

A lightweight Discord selfbot that forwards your incoming DMs to a designated guild (server) into channels named after the message author's ID, and sends messages from these channels back to the author via DM. This practically gives you a "DM helpdesk" directly on the server.

⚠️ **Warning**: Selfbots violate Discord's Terms of Service. Use this code at your own risk, for testing or educational purposes only. Account termination may occur.

## Features

📥 **Automatic text channel creation** `{userId}` in the target guild when receiving the first DM from a user

🔁 **Bidirectional forwarding**:
- DM → `#<userId>` on server (with ping to selected account)
- `#<userId>` → DM back to user

🧹 **Basic filters** (ignores bots, own messages, messages outside expected contexts)

## Requirements

- Node.js 16+
- Account token (not bot token) – selfbot
- Access and permissions on target server:
  - Channel Management (Create Channels)
  - Read/Write in channels

## Installation

```bash
git clone <your-repo>
cd <your-repo>
npm install
```

Create `.env`:

```env
TOKEN=your_discord_token
GUILD_ID=123456789012345678
PINGED_USER_ID=987654321098765432
```

- `TOKEN` – your account token (selfbot)
- `GUILD_ID` – ID of the server where channels will be created and messages forwarded
- `PINGED_USER_ID` – ID of the user that the bot should ping in the server channel for each new DM message

## Running

```bash
node index.js
# or if you have a script:
npm start
```

After login, you'll see in console:

```
Logged in as <your_name#tag>
```

## How it works

**Incoming DM** (`message.guildId === null`):
- Finds or creates channel `#<userId>` in target guild
- Sends message in format: `<@PINGED_USER_ID> <username>: <content>`

**Server message** (in target guild):
- If sent to a channel whose name is exactly `userId`, takes the content and sends it as DM back to that user

## Code structure (abbreviated)

- `handleIncomingMessage(message)` – handles DM → server
- `handleOutgoingMessage(message)` – handles server → DM

**Package used**: `discord.js-selfbot-v13`

## Limitations & Notes

- Selfbots are not supported by Discord and may stop working at any time
- If a user has locked DMs, sending back will fail – you won't see anything in the log
- Channel is named with pure `userId` – consider this in permissions and moderation
- Code forwards only pure text (`message.content`). Attachments/embeds are not handled

## Extensions (TODO)

- Forwarding attachments (images, files) and links
- Mapping `userId` → `#channel` with readable alias (e.g., `dm-<username>-<id>`)
- Permission verification and more elegant error handling
- Logging (winston / pino) and configuration via `config.*`

## Troubleshooting

**Channel not created?** Check that the account has "Create Channels" permission in the target guild.

**Reply message not sent?** User may have disabled DMs or not have you in friends.

**Nothing happening?** Check that the token is valid and `.env` is loaded (`dotenv.config()` runs).

## Legal/ToS Warning

This project is for educational purposes only. Using selfbots violates Discord's ToS and may lead to permanent account suspension. Authors are not responsible for any damages.

## Project Structure

```
DM-Relay/
├── index.js              # Main bot logic
├── package.json          # Dependencies
├── .env                  # Environment variables (create this)
├── .gitignore           # Git ignore rules
├── Dockerfile           # Docker container configuration
├── docker-compose.yml   # Docker Compose setup
├── .dockerignore        # Docker build optimization
└── README.md            # This file
```

## Docker Deployment

### Using Docker Compose

```bash
docker-compose up --build
```

### Manual Docker

```bash
docker build -t dm-relay .
docker run -d --name dm-relay --env-file .env dm-relay
```

---

**Note**: This bot uses Discord's selfbot API. Please ensure compliance with Discord's Terms of Service and use responsibly. 
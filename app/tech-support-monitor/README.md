# Tech Support Monitor

This package automatically duplicates messages sent TO the `tech_support` user into a team channel called `#tech_support_feed` for team visibility.

## How it works

1. **User sends DM to tech_support** → Message stays in the original DM
2. **System automatically duplicates** the message to `#tech_support_feed` 
3. **Message appears as posted by tech_support** with attribution to original sender
4. **Team can see all incoming requests** in the feed channel

## Prerequisites

1. A user named `tech_support` must exist
2. A channel named `tech_support_feed` must exist  
3. The `tech_support` user must be a member of the `tech_support_feed` channel

## Message Format

Duplicated messages appear in the team channel as:

```
tech_support: **Message from @john_doe:**
Hey, I'm having trouble with login issues...
```

## Features

- ✅ Only duplicates messages TO tech_support (not FROM tech_support)
- ✅ Preserves original DM conversation  
- ✅ Skips system messages (join/leave/etc)
- ✅ Includes metadata tracking original message
- ✅ Error handling and logging
- ✅ Configurable (can be disabled by removing callback)

## Configuration

The monitoring is automatically enabled when the server starts. To disable:

```javascript
import { removeTechSupportMonitor } from 'meteor/rocketchat:tech-support-monitor';
removeTechSupportMonitor();
```

## Files

- `server/techSupportDuplication.js` - Main implementation
- `server/index.js` - Module loader
- `package.js` - Meteor package definition
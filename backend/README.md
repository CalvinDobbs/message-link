# calvin-message-backend

A messaging app made with node.

To run create a file in the root directory named "nodemon.json" with the following content:

```json
{
  "env": {
    "MONGO_URI": "", //URL for mongo atlas database
    "ACCESS_TOKEN_SECRET": "", //any long string
    "FRONTEND_URL": "" //some url or * (used for cors)
  }
}
```

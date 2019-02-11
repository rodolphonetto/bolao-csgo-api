module.exports = {
  mongoURI: `mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
  }@cluster0-uypd6.mongodb.net/bolao?retryWrites=true`,
};

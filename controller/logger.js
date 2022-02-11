const { createLogger, transports, format } = require("winston");

//logging function
const advertiseLogger = createLogger({
  transports: [
    new transports.File({
      filename: "advertisement.log",
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      filename: "advertisementError.log",
      level: "error",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

module.exports = {advertiseLogger};

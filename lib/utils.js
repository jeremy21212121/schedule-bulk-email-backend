module.exports = {
  text: {
    buildText: (contactMsgObj) =>
      `You have a message from your website!
      From: ${contactMsgObj.name}  <${contactMsgObj.email}>
      Message: ${contactMsgObj.text}`,

    sanitizeInput: (str, len=1024) => str.replace(/[^A-Za-z-_0-9 .,?!]/g, " ").trim().substring(0,len),
    // removes questionable characters and ensures the fields arent obnoxiously long
    // * you must make sure that str is a string before calling either of these functions. This is done in this app by the verifyContactMsgObj middleware.
    sanitizeEmailAddr: (str) => str.replace(/[^A-Za-z-_0-9.+@]/g, '').substring(0,100)
  },
  buildError: (name) => {
    const e = Error(name);
    e.name = name;
    return e;
  }
};

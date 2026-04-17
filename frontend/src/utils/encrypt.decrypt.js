import CryptoJS from "crypto-js";

// const secretKey = process.env.REACT_APP_ADMIN_KEY;
// const iv = process.env.REACT_APP_ADMIN_IV;
const secretKey = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_ADMIN_KEY); // 128-bit key in hex
const iv = CryptoJS.enc.Utf8.parse(process.env.REACT_APP_ADMIN_IV); 
// Encrypt function
function encrypt(req) {
  try {
    if (typeof req === "object") {
      req = JSON.stringify(req);
    }
    const encrypted = CryptoJS.AES.encrypt(req, secretKey, {
      iv: iv,
    }).toString();
    // callback(encrypted);
    return encrypted
    // callback(req);
  } catch (error) {
    return { req }

    // callback({ req });
  }
}
function decrypt(req) {
  if (req != undefined && req.trim() != "") {
    const cleanedData = req.replace(/\\n/g, "").replace(/'/g, "");
    const decrypted = CryptoJS.AES.decrypt(cleanedData, secretKey, {
      iv: iv,
    });
    const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
    let decryptionSend;
    try {
      decryptionSend = isValidJson(decryptedData) ? JSON.parse(decryptedData) : decryptedData
    } catch (error) {
      decryptionSend = decryptedData; // Return as string if not a valid JSON
    }
    return decryptionSend

  } else {
    return
  }
}

function isValidJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}


export { encrypt, decrypt };
import axios from "axios";
import { decrypt, encrypt } from "./encrypt.decrypt";
import Constant, { Codes } from "../config/constant";

export async function fetchWrapper(url, body, method) {
  
  let token = ''

  const encryptedUser = localStorage.getItem(Constant.AUTH_KEY);
  if(encryptedUser){
    const user = decrypt(encryptedUser)
    
    if(user && user.device_info.token){
      token = user.device_info.token
    }
  }
  const AppUrl = ['/auth/view_content_page', '/auth/get_credentials']
  const requestOptions = {
    method: method,
    url: `${Constant.API_BASE_URL}${url}`,
    headers: {
      "api-key":  encrypt(process.env.REACT_APP_API_KEY),
      "token" : token ? encrypt(token) : null,
      "accept-language": "en",
      // "access-level" : AppUrl.includes(url)  ? '3' : '1',
      // "device_type" : 'W'
    },
    data: body instanceof FormData ? body : encrypt(body),
  };
  
  if(!(body instanceof FormData)) {
    // requestOptions.headers['Content-Type'] = 'application/json';
    requestOptions.headers['Content-Type'] = 'text/plain';
  }
  
  return axios(requestOptions)
    .then((response) => {
    
      const decryptedData = decrypt(response?.data); 
      
      return decryptedData; 
      // return response;
      // return response?.data
    })
    .catch((error) => {
      const errors = decrypt(error?.response?.data)
      // const errors = error?.response?.data

      if (errors.code == Codes.UNAUTHORIZED) {
        localStorage.removeItem(Constant.AUTH_KEY);
        window.location.href = Constant.PUBLIC_URL;
      }
      throw errors
    });
}


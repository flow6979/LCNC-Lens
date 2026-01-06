// Store captured cookies for popup to retrieve
let capturedZendutyCookies = null;

console.log('Background script loaded');

// Listen for requests to Zenduty
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    console.log('WebRequest intercepted:', details.url, 'Type:', details.type);
    
    // Capture from any request type
    const headers = details.requestHeaders;
    console.log('Request headers:', headers);
    
    const cookieHeader = headers.find(h => h.name.toLowerCase() === 'cookie');
    
    if (cookieHeader && cookieHeader.value) {
      console.log('Cookie header found:', cookieHeader.value);
      
      // Parse the cookie string to extract csrftoken
      const cookies = cookieHeader.value.split('; ');
      let csrftoken = '';
      
      cookies.forEach(cookie => {
        const [name, value] = cookie.split('=');
        if (name === 'csrftoken') {
          csrftoken = value;
        }
      });
      
      capturedZendutyCookies = {
        cookieString: cookieHeader.value,
        csrftoken: csrftoken
      };
      
      console.log('Captured Zenduty cookies from request:', capturedZendutyCookies);
    } else {
      console.log('No cookie header in this request');
    }
  },
  { urls: ["https://www.zenduty.com/*"] },
  ["requestHeaders", "extraHeaders"]
);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);
  if (request.type === 'getZendutyCookies') {
    console.log('Sending cookies:', capturedZendutyCookies);
    sendResponse(capturedZendutyCookies);
  }
  return true;
});

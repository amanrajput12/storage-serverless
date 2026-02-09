  
const Privatekey = process.env.CLOUDFRONT_PRIVATE_KEY;
// console.log("Cloudfront config file loaded, env var is ");
// import K3CE296GJ496XA
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
let distribution ='https://d19vnk21ika5bl.cloudfront.net'
// this is publi key, not secret key, so it's fine to have it in code

const keyPairId = "K3CE296GJ496XA";


const dateLessThan =  new Date(Date.now() +1000 *60*60 ).toISOString(); // Expires in 1 hour



export const createCloudfrontSignedUrl = async ({ key,download=false,filename }) => {
  console.log("Creating Cloudfront signed URL with key:", key);

let url = `${distribution.replace(/\/$/, "")}/${key}?response-content-disposition=${encodeURIComponent(
  `
  ${ download ? "attachment" : "inline"}; filename="${filename}"`
)}`;



// ?response-content-disposition=attachment;filename="test.png
console.log("URL to sign:", url);


 
const signedurl = getSignedUrl({
    url,
    keyPairId,
    privateKey: Privatekey,
    dateLessThan
});

console.log("Generated Cloudfront signed URL:", signedurl);
return signedurl;

}
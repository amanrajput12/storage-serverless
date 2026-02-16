  
const Privatekey = process.env.CLOUDFRONT_PRIVATE_KEY;
// console.log("Cloudfront config file loaded, env var is ");
// import K3CE296GJ496XA
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
let distribution ='https://d19vnk21ika5bl.cloudfront.net'
// this is publi key, not secret key, so it's fine to have it in code

const keyPairId = "K3CE296GJ496XA";





export const createCloudfrontSignedUrl = async ({ key, download = false, filename }) => {

  // Test for 1hr minutes validity
  const dateLessThan = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    console.log("time create ", dateLessThan);
  const disposition = `${download ? "attachment" : "inline"}; filename="${filename}"`;

  const url = `${distribution.replace(/\/$/, "")}/${key}?response-content-disposition=${encodeURIComponent(disposition)}`;

  const signedurl = getSignedUrl({
    url,
    keyPairId,
    privateKey: Privatekey,
    dateLessThan
  });

  console.log("Generated signed URL inside cloudfront:", signedurl);

  return signedurl;
};

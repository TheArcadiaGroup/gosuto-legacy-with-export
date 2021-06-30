import ASN1 from '@lapo/asn1js';
import Base64 from '@lapo/asn1js/base64';
import Hex from '@lapo/asn1js/hex';
import { encodeBase64 } from 'tweetnacl-util';
import { decodeBase16, Keys } from 'casper-client-sdk';
export function parseAlgorithm(val) {
  let decoded;
  try {
    const reHex = /^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/;
    const der = reHex.test(val)
      ? Hex.decode(val)
      : Base64.unarmor(val);
    decoded = ASN1.decode(der);
    let algorithmCheck;
    let algorithm;
    let hexKey;
    let secretKeyBase64;

    // Get the algorithm
    try {
      // for Ed25519
      algorithmCheck = decoded.toPrettyString().split('\n')[3].split('|')[1];
      if (!algorithmCheck) {
        // for Secp256k1
        algorithmCheck = decoded
          .toPrettyString()
          .split('\n')[4]
          .split('|')[1];
      }
      if (!algorithmCheck) {
      }
      if (algorithmCheck === 'curveEd25519') {
        algorithm = ('ed25519');
         hexKey = decoded.toPrettyString().split('\n')[4].split('|')[1];
        // secretKeyBase64 = (encodeBase64(decodeBase16(hexKey)));
        secretKeyBase64 = (decodeBase16(hexKey));
      } else {
        algorithm = (algorithmCheck);
         hexKey = decoded.toPrettyString().split('\n')[2].split('|')[1];
        // secretKeyBase64 = (encodeBase64(decodeBase16(hexKey)));
        secretKeyBase64 = (decodeBase16(hexKey));
      }
      return {algorithm,hexKey,secretKeyBase64}
    } catch (err) {
    }
  } catch (e) {
  }
}


export const casperDelegationContractHexCode =
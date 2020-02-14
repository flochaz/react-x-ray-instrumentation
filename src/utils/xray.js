import * as XRay from "aws-sdk/clients/xray";
import { Auth } from 'aws-amplify';
const crypto = window.crypto;

function getHexId(length) {
  let bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16);
  }
  return hex.substring(0, length);
}

function getHexTime() {
  return Math.round(new Date().getTime() / 1000).toString(16);
}

function getEpochTime() {
  return new Date().getTime() / 1000;
}

export function getTraceHeader(segment) {
  return "Root=" + segment.trace_id + ";Parent=" + segment.id + ";Sampled=1";
}

export async function beginSegment() {
  let user = await Auth.currentAuthenticatedUser();
  let segment = {};
  let traceId = "1-" + getHexTime() + "-" + getHexId(24);

  let id = getHexId(16);
  let startTime = getEpochTime();

  segment.trace_id = traceId;
  segment.id = id;
  segment.start_time = startTime;
  segment.name = "Browser";
  segment.in_progress = true;
  segment.user = user.username;
  segment.service = {'version': '1.0'};
  segment.http = {
    request: {
      url: window.location.href
    }
  };

  let documents = [];
  documents[0] = JSON.stringify(segment);
  putDocuments(documents);
  return segment;
}

export function endSegment(segment) {
  let endTime = getEpochTime();
  segment.end_time = endTime;
  segment.in_progress = false;
  let documents = [];
  documents[0] = JSON.stringify(segment);
  putDocuments(documents);
}

async function putDocuments(documents) {
  let credentials = await Auth.currentCredentials();
  let xray = new XRay({
      region: 'us-west-2',
      credentials: credentials,
  });
  let params = {
    TraceSegmentDocuments: documents
  };
  try {
    await xray.putTraceSegments(params).promise();
  } catch (err) {
    console.log(err, err.stack);
  }
}


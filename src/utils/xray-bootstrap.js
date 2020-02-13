// ensures all aws-sdk calls are based on a singleton, captured using the singleton xray-sdk.
import aws from 'aws-sdk';
import { captureAWS } from 'aws-xray-sdk';

const captured = captureAWS(aws);
export default captured;
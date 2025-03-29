declare module 'baidu-aip-sdk' {
  interface RecognitionResult {
    err_no: number;
    err_msg: string;
    result?: string[];
  }

  class AipSpeechClient {
    constructor(appId: string, apiKey: string, secretKey: string);
    recognize(audio: string, format: string, rate: number): Promise<RecognitionResult>;
  }

  export default AipSpeechClient;
} 
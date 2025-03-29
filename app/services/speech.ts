import * as FileSystem from 'expo-file-system';
import * as Application from 'expo-application';

const APP_ID = '118278533';
const API_KEY = 'Eq7NydiZb8kg9d1JrySzyuCS';
const SECRET_KEY = 'Sy456prFTd9qyOMNJOhNKiW1NfVDGOUK';

// Token缓存
let cachedToken: string | null = null;
let tokenExpireTime: number = 0;

async function getAccessToken(): Promise<string> {
  // 如果缓存的token还有效，直接返回
  if (cachedToken && Date.now() < tokenExpireTime) {
    return cachedToken;
  }

  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    // 缓存token，设置过期时间为29天（token有效期是30天）
    cachedToken = data.access_token;
    tokenExpireTime = Date.now() + (29 * 24 * 60 * 60 * 1000);
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

export async function transcribeAudio(audioUri: string): Promise<string> {
  try {
    // 读取音频文件
    const audioContent = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 获取访问令牌
    const accessToken = await getAccessToken();
    console.log('Access token:', accessToken);

    // 获取设备ID作为cuid
    const deviceId = await Application.getIosIdForVendorAsync() || 
                    Application.getAndroidId() || 
                    'my-app';
    console.log('Device ID:', deviceId);

    // 处理Base64字符串
    const cleanedBase64 = audioContent
      .replace(/[\n\r\s]/g, '')  // 移除所有空白字符
      .replace(/=+$/, '');      // 移除末尾的填充字符
    
    // 计算实际音频数据长度
    const byteLength = Math.floor((cleanedBase64.length * 3) / 4);

    // 发送请求到百度语音识别
    const requestBody = {
      format: 'wav',  // 使用wav格式
      rate: 16000,
      channel: 1,
      cuid: deviceId,
      dev_pid: 80001,
      token: accessToken,
      speech: cleanedBase64,
      len: byteLength
    };

    // 打印请求信息（不包含完整的speech数据）
    console.log('Request URL:', 'https://vop.baidu.com/pro_api');
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    console.log('Request body:', {
      ...requestBody,
      speech: cleanedBase64.substring(0, 100) + '...',
      len: byteLength
    });

    const response = await fetch(
      'https://vop.baidu.com/pro_api',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();
    console.log('Baidu API response:', result);

    if (result.err_no === 0 && result.result && result.result.length > 0) {
      return result.result[0];
    } else {
      throw new Error(result.err_msg || '语音识别失败');
    }
  } catch (error) {
    console.error('Speech recognition error:', error);
    throw error;
  }
}
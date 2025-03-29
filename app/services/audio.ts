import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// 录音实例
let recording: Audio.Recording | null = null;

// 生成唯一的文件名
const generateAudioFileName = () => {
  const timestamp = new Date().getTime();
  return `${FileSystem.documentDirectory}voice_${timestamp}.m4a`;
};

// 清理录音实例
const cleanupRecording = async () => {
  if (recording) {
    try {
      await recording.stopAndUnloadAsync();
    } catch (error) {
      console.error('清理录音实例失败:', error);
    }
    recording = null;
  }
};

// 开始录音
export const startRecording = async (): Promise<void> => {
  try {
    // 确保清理之前的录音实例
    await cleanupRecording();

    // 配置音频会话
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // 创建新的录音实例
    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await newRecording.startAsync();
    recording = newRecording;

  } catch (error) {
    console.error('Failed to start recording:', error);
    throw error;
  }
};

// 停止录音
export const stopRecording = async (): Promise<{ uri: string; duration: number }> => {
  try {
    if (!recording) {
      throw new Error('没有正在进行的录音');
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI() || '';
    const status = await recording.getStatusAsync();
    const duration = Math.round((status as any).durationMillis / 1000); // 转换为秒

    // 将录音文件移动到应用文档目录
    const newUri = generateAudioFileName();
    await FileSystem.moveAsync({
      from: uri,
      to: newUri
    });

    // 清理录音实例
    recording = null;
    return { uri: newUri, duration };

  } catch (error) {
    console.error('Failed to stop recording:', error);
    // 确保在出错时也清理录音实例
    recording = null;
    throw error;
  }
};

// 取消录音
export const cancelRecording = async (): Promise<void> => {
  try {
    await cleanupRecording();
  } catch (error) {
    console.error('Failed to cancel recording:', error);
    throw error;
  }
};

// 播放语音消息
export const playVoiceMessage = async (uri: string): Promise<void> => {
  try {
    const sound = new Audio.Sound();
    await sound.loadAsync({ uri });
    await sound.playAsync();

    // 播放完成后释放资源
    sound.setOnPlaybackStatusUpdate(async (status: any) => {
      if (status.didJustFinish) {
        await sound.unloadAsync();
      }
    });

  } catch (error) {
    console.error('Failed to play voice message:', error);
    throw error;
  }
};

// 删除语音文件
export const deleteVoiceFile = async (uri: string): Promise<void> => {
  try {
    await FileSystem.deleteAsync(uri);
  } catch (error) {
    console.error('Failed to delete voice file:', error);
    throw error;
  }
}; 
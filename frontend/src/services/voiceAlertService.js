function getGreekVoice() {
  const voices = window.speechSynthesis.getVoices();

  return (
    voices.find(
      (voice) =>
        voice.lang?.toLowerCase() === 'el-gr'
    ) ||
    voices.find(
      (voice) =>
        voice.lang?.toLowerCase().startsWith('el')
    ) ||
    null
  );
}

export function speakEmergencyAlert(message) {
  if (!message?.trim()) {
    return {
      success: false,
      reason: 'EMPTY_MESSAGE',
    };
  }

  if (
    !('speechSynthesis' in window) ||
    !('SpeechSynthesisUtterance' in window)
  ) {
    return {
      success: false,
      reason: 'NOT_SUPPORTED',
    };
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(message);

  utterance.lang = 'el-GR';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  const greekVoice = getGreekVoice();

  if (greekVoice) {
    utterance.voice = greekVoice;
  }

  window.speechSynthesis.speak(utterance);

  return {
    success: true,
    voice: greekVoice?.name || null,
  };
}

export function stopEmergencyAlert() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
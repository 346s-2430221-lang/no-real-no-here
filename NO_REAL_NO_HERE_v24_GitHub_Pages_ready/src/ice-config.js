/*
 * WebRTC ICE 설정.
 * STUN만으로는 일부 통신사/공유기/NAT 환경에서 음성 연결이 실패할 수 있습니다.
 * 실제 배포에서는 운영자가 발급한 TURN 자격 증명을 아래 배열에 추가해야 합니다.
 * 비밀 자격 증명을 공개 GitHub 저장소에 커밋하지 마세요.
 */
window.NRNH_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
  // TURN 예시(실제 값으로 교체할 때만 주석 해제):
  // { urls: 'turn:turn.example.com:3478', username: 'TEMP_USERNAME', credential: 'TEMP_PASSWORD' },
  // { urls: 'turns:turn.example.com:5349', username: 'TEMP_USERNAME', credential: 'TEMP_PASSWORD' }
];

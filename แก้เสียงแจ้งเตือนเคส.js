// ===== ระบบเสียงเตือนเคสใหม่ - แก้แล้ว =====
let alarmAudio = null;
let isAlarmPlaying = false;
let audioUnlocked = false;

function initAlarm() {
  if (alarmAudio) return;
  // ใช้ไฟล์เดียวกับที่คุณใช้อยู่
  alarmAudio = new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=emergency-siren-112438.mp3');
  alarmAudio.loop = true;
  alarmAudio.volume = 1.0;
  alarmAudio.preload = 'auto';
}

// ต้อง unlock เสียงด้วยคลิกแรกของเจ้าหน้าที่
function unlockAudio() {
  if (audioUnlocked) return;
  initAlarm();
  alarmAudio.play().then(() => {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    audioUnlocked = true;
    console.log('Audio unlocked พร้อมเตือนแล้ว');
  }).catch(()=>{});
}

// เรียก unlock ตอน Login / กด Demo
document.addEventListener('click', unlockAudio, {once: true});
document.addEventListener('touchstart', unlockAudio, {once: true});
// ถ้ามีปุ่ม Demo ให้ผูกเพิ่ม
const demoBtn = document.querySelector('#demoBtn, [onclick*="demo"], button');
if(demoBtn) demoBtn.addEventListener('click', unlockAudio);

function playAlarm() {
  if (!audioUnlocked) initAlarm();
  if (isAlarmPlaying) return;
  initAlarm();
  alarmAudio.currentTime = 0;
  alarmAudio.play().then(() => {
    isAlarmPlaying = true;
    // สั่นด้วยถ้าเป็นมือถือ
    if (navigator.vibrate) navigator.vibrate([500,200,500]);
  }).catch(e => {
    console.log('play blocked:', e);
    // ถ้ายังบล็อค ให้โชว์ปุ่มให้กดเปิดเสียงเอง
    showEnableSoundButton();
  });
}

function stopAlarm() {
  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }
  isAlarmPlaying = false;
  if (navigator.vibrate) navigator.vibrate(0);
}

function showEnableSoundButton() {
  if (document.getElementById('enableSoundBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'enableSoundBtn';
  btn.textContent = '🔊 กดเพื่อเปิดเสียงแจ้งเตือน';
  btn.style = 'position:fixed;top:10px;right:10px;z-index:99999;background:red;color:white;padding:12px 20px;border-radius:8px;border:none;font-weight:bold;';
  btn.onclick = () => { unlockAudio(); btn.remove(); playAlarm(); };
  document.body.appendChild(btn);
}

// ===== ผูกกับระบบเคส =====
// 1. ตอนมีเคสใหม่เข้า (แทนที่ onSnapshot / onChildAdded เดิม)
function onNewCaseArrived(caseData) {
  // โค้ดเดิมที่แสดงตาราง...
  playAlarm();
}

// 2. ตอนกดรับเคส
function onAcceptCase(caseId) {
  stopAlarm(); // เสียงหยุดทันทีตามที่คุณต้องการ
  // โค้ดเดิม update status -> กำลังช่วยเหลือ
  // firebase.firestore().collection('cases').doc(caseId).update({status:'helping'})
}

// ตัวอย่างถ้าใช้ Firestore:
// db.collection('cases').where('status','==','pending').onSnapshot(snap => {
//   snap.docChanges().forEach(change => {
//     if(change.type === 'added'){
//        onNewCaseArrived(change.doc.data());
//     }
//   })
// });
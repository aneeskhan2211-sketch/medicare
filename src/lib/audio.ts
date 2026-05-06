
export const playSuccessSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/success-1-6297.wav');
  audio.volume = 0.4;
  audio.play().catch(err => console.log('Audio play failed:', err));
};

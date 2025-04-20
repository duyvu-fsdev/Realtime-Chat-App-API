const generateOtp = (length: number = 4): string => {
  const chars = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
};
export default generateOtp;

export const generateProfilePicture = (fullName, username, age = null) => {
  const label = encodeURIComponent((fullName || username || 'User').trim() || 'User');
  
  // Color based on age groups
  let bg = '0e7490'; // default cyan
  if (age !== null) {
    if (age < 20) bg = 'c026d3'; // purple for under 20
    else if (age < 40) bg = '0e7490'; // cyan for 20-40
    else bg = '059669'; // green for 40+
  }
  
  return `https://ui-avatars.com/api/?name=${label}&background=${bg}&color=fff&size=128&bold=true`;
};
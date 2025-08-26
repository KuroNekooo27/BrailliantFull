export const convertTextToBrailleDots = (text) => {
    if (!text) return "";
  
    const brailleDotsLookup = {
      a: "100000",
      b: "110000",
      c: "100100",
      d: "100110",
      e: "100010",
      f: "110100",
      g: "110110",
      h: "110010",
      i: "010100",
      ı: "010100",
      j: "010110",
      k: "101000",
      l: "111000",
      m: "101100",
      n: "101110",
      o: "101010",
      ö: "010100",
      p: "111100",
      q: "111110",
      r: "111010",
      s: "011100",
      t: "011110",
      u: "101001",
      ü: "101001",
      v: "111001",
      w: "010111",
      x: "101101",
      y: "101111",
      z: "101011",
      1: "100000",
      2: "110000",
      3: "100100",
      4: "100110",
      5: "100010",
      6: "110100",
      7: "110110",
      8: "110010",
      9: "010100",
      0: "010110",
    };
  
    const NUMBER_SIGN = "001111";
    const LETTER_SIGN = "000011";
    const UPPERCASE_SIGN = "000001";
    const UPPERCASE_WORD_SIGN = "000001 000001"; // Double sign for all-caps words
    
    let brailleDots = "";
    let inNumberMode = false;
    let inUppercaseWord = false;
    let prevCharWasUppercase = false;
  
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const lowerChar = char.toLowerCase();
      const isDigit = /[0-9]/.test(char);
      const isLetter = /[a-zıöü]/i.test(char);
      const isUppercase = char === char.toUpperCase() && char !== char.toLowerCase();
      const nextChar = text[i + 1];
      const nextIsUppercase = nextChar && nextChar === nextChar.toUpperCase() && nextChar !== nextChar.toLowerCase();
  
      // Check if we're starting an all-caps word
      if (isUppercase && isLetter && !inUppercaseWord && !inNumberMode) {
        if (nextIsUppercase) {
          // Multiple uppercase letters in sequence indicates all-caps word
          inUppercaseWord = true;
          brailleDots += UPPERCASE_WORD_SIGN + " ";
        } else if (!prevCharWasUppercase) {
          // Single uppercase letter
          brailleDots += UPPERCASE_SIGN + " ";
        }
      }
  
      // Handle mode transitions
      if (isDigit && !inNumberMode) {
        // Switch to number mode
        brailleDots += NUMBER_SIGN + " ";
        inNumberMode = true;
        inUppercaseWord = false;
      } else if (isLetter && inNumberMode) {
        // Switch back to letter mode
        brailleDots += LETTER_SIGN + " ";
        inNumberMode = false;
      }
  
      // Add the character's braille
      if (brailleDotsLookup[lowerChar]) {
        brailleDots += brailleDotsLookup[lowerChar] + " ";
      } else {
        // For unknown characters, use empty cell
        brailleDots += "000000 ";
      }
  
      // Check if we're ending an all-caps word
      if (inUppercaseWord && (!nextIsUppercase || !isLetter)) {
        inUppercaseWord = false;
      }
  
      prevCharWasUppercase = isUppercase;
    }
  
    // Remove the trailing space
    return brailleDots.trim();
  };
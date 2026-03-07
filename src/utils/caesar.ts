function encrypt(text: string, shift = 4): string {
  const s = shift % 26;

  return text.split("").map(char => {
    const code = char.charCodeAt(0);

    // A - Z
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(
        ((code - 65 + s) % 26) + 65
      );
    }

    // a - z
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(
        ((code - 97 + s) % 26) + 97
      );
    }

    return char;
  }).join("");
}

function decrypt(text: string, shift = 4): string {
  return encrypt(text, 26 - (shift % 26));
}

export {encrypt, decrypt}

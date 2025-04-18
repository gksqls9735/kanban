export const lightenColor = (colorName: string, lightenAmount: number): string => {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) {
    console.error("Canvas context를 생성할 수 없습니다.");
    return "#CCCCCC"; // 컨텍스트 생성 실패 시 중간 회색 반환
  }

  // amount 값을 -1과 1 사이로 제한 (안정성 및 명확성)
  const clampedAmount = Math.max(-0.9, Math.min(1, lightenAmount));
  try {
    // 입력된 색상을 fillStyle에 설정하여 표준 형식으로 변환
    ctx.fillStyle = colorName;
    const fillStyle = ctx.fillStyle;

    let r: number, g: number, b: number;

    // 1. Hex 코드 처리
    if (fillStyle.startsWith("#")) {
      let hex = fillStyle.slice(1);
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length !== 6) {
        throw new Error("Invalid hex color format");
      }
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
    // 2. rgb() 또는 rgba() 형식 처리
    else {
      const rgbMatch = fillStyle.match(/\d+/g);
      if (!rgbMatch || rgbMatch.length < 3) {
        throw new Error(`Could not parse color format: ${fillStyle}`);
      }
      r = parseInt(rgbMatch[0], 10);
      g = parseInt(rgbMatch[1], 10);
      b = parseInt(rgbMatch[2], 10);
    }

    // amount가 0이면 원본 색상 반환
    if (clampedAmount === 0) {
      return `rgb(${r}, ${g}, ${b})`;
    }

    let newR: number, newG: number, newB: number;

    // 밝기 조절 계산
    if (clampedAmount > 0) {
      // 밝게 (Lighten): 흰색(255)에 가깝게
      newR = r + (255 - r) * clampedAmount;
      newG = g + (255 - g) * clampedAmount;
      newB = b + (255 - b) * clampedAmount;
    } else {
      // 어둡게 (Darken): 검은색(0)에 가깝게
      // newValue = oldValue + oldValue * amount (amount는 음수)
      // 또는 newValue = oldValue * (1 + amount)
      newR = r * (1 + clampedAmount);
      newG = g * (1 + clampedAmount);
      newB = b * (1 + clampedAmount);
    }

    // 최종 값을 0과 255 사이로 제한하고 정수로 반올림
    newR = Math.round(Math.max(0, Math.min(255, newR)));
    newG = Math.round(Math.max(0, Math.min(255, newG)));
    newB = Math.round(Math.max(0, Math.min(255, newB)));

    // 조절된 색상을 RGB 문자열로 반환
    return `rgb(${newR}, ${newG}, ${newB})`;

  } catch (error) {
    console.error(`Invalid colorName or processing error: "${colorName}"`, error);
    // 오류 발생 시 기본 중간 회색 반환
    return "#CCCCCC";
  }

};  
